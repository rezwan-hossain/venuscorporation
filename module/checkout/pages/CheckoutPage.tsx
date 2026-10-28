// module/checkout/pages/CheckoutPage.tsx
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { BillingForm, BillingFormRef } from "../components/BillingForm";
import { OrderSummary } from "../components/OrderSummary";
import { HeroText } from "@/components/ui/HeroText";
import { BillingFormData, CheckoutItem, AppliedCoupon } from "@/types/checkout";
import { useRouter } from "next/navigation";
import { placeOrder } from "@/app/actions/checkout";
import { initiateShurjoPayPayment } from "@/app/actions/payment";
import { EventQuestions } from "../components/EventQuestions";
import {
  asksQuestion,
  checkExtraAnswer,
  getEventCategory,
  getExtraQuestions,
  usesRaceFields,
  type ExtraAnswers,
} from "@/lib/event-checkout-form";

type CheckoutPageProps = {
  item: CheckoutItem;
  userEmail: string;
  userName: string;
  eventType: string;
  /** MARATHON, CONFERENCE, … — decides which questions are asked. */
  category: string;
};

// Bangladeshi phone number regex for validation
const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckoutPage = ({
  item,
  userEmail,
  userName,
  eventType,
  category,
}: CheckoutPageProps) => {
  const router = useRouter();
  const billingFormRef = useRef<BillingFormRef>(null);

  // What this event asks (rules: lib/event-checkout-form.ts)
  //   raceFields     — marathons: gender, blood group, T-shirt …
  //   extraQuestions — other categories: company, guests …
  const raceFields = usesRaceFields(category);
  const asksTshirt = raceFields && asksQuestion(category, eventType, "T-shirt size");
  const extraQuestions = useMemo(() => getExtraQuestions(category, eventType), [category, eventType]);

  // Answers to the extra questions, and their error messages
  const [extraAnswers, setExtraAnswers] = useState<ExtraAnswers>({});
  const [extraErrors, setExtraErrors] = useState<Record<string, string>>({});

  const updateExtraAnswer = (key: string, value: string) => {
    setExtraAnswers((prev) => ({ ...prev, [key]: value }));
    // Re-check this one answer as the user types
    const question = extraQuestions.find((q) => q.key === key);
    if (question) setExtraErrors((prev) => ({ ...prev, [key]: checkExtraAnswer(question, value) }));
  };

  /** Check every extra question; shows the errors. Returns true if all are fine. */
  const validateExtraAnswers = () => {
    const errors: Record<string, string> = {};
    for (const q of extraQuestions) errors[q.key] = checkExtraAnswer(q, extraAnswers[q.key]);
    setExtraErrors(errors);
    return Object.values(errors).every((e) => !e);
  };

  const [paymentMethod, setPaymentMethod] = useState("shurjopay");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guards against duplicate orders: `submittingRef` blocks re-entry before the
  // `loading` re-render lands (fast double-click), and `orderIdRef` remembers an
  // order that was already created so a failed payment start retries payment
  // for that order instead of placing a new one.
  const submittingRef = useRef(false);
  const orderIdRef = useRef<string | null>(null);

  // Returning from the gateway via the back button can restore this page from
  // the bfcache with the button still stuck in its loading state.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        submittingRef.current = false;
        setLoading(false);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  // ─── Coupon state ───
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [finalPrice, setFinalPrice] = useState(item.price * item.qty);

  const [formData, setFormData] = useState<BillingFormData>({
    fullName: userName?.trim() || "",
    email: userEmail?.trim() || "",
    phone: "",
    gender: "",
    birthDate: "",
    ageCategory: "",
    bloodGroup: "",
    tshirtSize: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    communityName: "",
    runnerCategory: "",
  });

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = useMemo(() => {
    // Check required fields
    const requiredFields: (keyof BillingFormData)[] = [
      "fullName",
      "email",
      "phone",
      // Race fields — marathons only
      ...(raceFields
        ? ([
            "gender",
            "birthDate",
            "ageCategory",
            "bloodGroup",
            "runnerCategory",
            ...(asksTshirt ? ["tshirtSize"] : []),
          ] as (keyof BillingFormData)[])
        : []),
    ];

    // Check if all required fields have values
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        return false;
      }
    }

    // Validate email format
    if (!EMAIL_REGEX.test(formData.email)) {
      return false;
    }

    // Validate phone format
    const cleanPhone = formData.phone.replace(/[\s-]/g, "");
    if (!BD_PHONE_REGEX.test(cleanPhone)) {
      return false;
    }

    // Validate birth date is in the past (marathons only)
    if (raceFields && new Date(formData.birthDate) >= new Date()) {
      return false;
    }

    // Extra questions (non-marathon events) must all be fine
    if (extraQuestions.some((q) => checkExtraAnswer(q, extraAnswers[q.key]))) {
      return false;
    }

    // Validate emergency contact number if provided
    if (formData.emergencyContactNumber?.trim()) {
      const cleanEmergencyPhone = formData.emergencyContactNumber.replace(
        /[\s-]/g,
        "",
      );
      if (!BD_PHONE_REGEX.test(cleanEmergencyPhone)) {
        return false;
      }
    }

    return true;
  }, [formData, asksTshirt, raceFields, extraQuestions, extraAnswers]);

  const updateField = (field: keyof BillingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Coupon handlers ───
  const handleApplyCoupon = (coupon: AppliedCoupon, newFinalPrice: number) => {
    setAppliedCoupon(coupon);
    setFinalPrice(newFinalPrice);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFinalPrice(item.price * item.qty);
  };

  const handlePlaceOrder = async () => {
    if (submittingRef.current) return;
    setError("");

    // Validate form and focus on first invalid field
    const billingValid = billingFormRef.current?.validateAndFocus();
    const extrasValid = validateExtraAnswers();
    const isValid = billingValid && extrasValid;

    if (!isValid) {
      setError("Please fill in all required fields correctly");
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      const safeArgs = JSON.parse(
        JSON.stringify({
          packageId: item.packageId,
          eventId: item.eventId,
          qty: item.qty,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          // Race fields (marathons). The server ignores them for other categories.
          gender: formData.gender,
          birthDate: formData.birthDate,
          ageCategory: formData.ageCategory,
          bloodGroup: formData.bloodGroup,
          // No T-shirt asked (virtual run) → saved as "VIRTUAL", as before.
          tshirtSize: asksTshirt ? formData.tshirtSize : "VIRTUAL",
          emergencyContactName: formData.emergencyContactName || "",
          emergencyContactNumber: formData.emergencyContactNumber || "",
          communityName: formData.communityName || "",
          runnerCategory: formData.runnerCategory,
          // Answers to the extra questions (non-marathon events)
          details: extraAnswers,
          paymentMethod,
          couponCode: appliedCoupon?.code || undefined,
        }),
      );

      let orderId = orderIdRef.current;

      if (!orderId) {
        const orderResult = await placeOrder(safeArgs);

        console.log("🛒 Place order result:", orderResult);

        if (orderResult.error) {
          setError(orderResult.error);
          setLoading(false);
          submittingRef.current = false;
          return;
        }

        if (!orderResult.orderId) {
          setError("Failed to create order");
          setLoading(false);
          submittingRef.current = false;
          return;
        }

        orderId = orderResult.orderId;
        orderIdRef.current = orderId;
      }

      // ✅ Step 2: If ShurjoPay → initiate payment & redirect
      if (paymentMethod === "shurjopay") {
        const paymentArgs = JSON.parse(
          JSON.stringify({
            orderId,
            customerName: formData.fullName,
            customerEmail: formData.email || userEmail,
            customerPhone: formData.phone,
          }),
        );

        const paymentResult = await initiateShurjoPayPayment(paymentArgs);

        console.log("💳 ShurjoPay initiation result:", paymentResult);

        if (paymentResult.error) {
          setError(paymentResult.error);
          setLoading(false);
          submittingRef.current = false;
          return;
        }

        if (paymentResult.checkoutUrl) {
          // ✅ Redirect to ShurjoPay checkout page
          window.location.href = paymentResult.checkoutUrl;
          return;
        }

        setError("Failed to get payment URL");
        setLoading(false);
        submittingRef.current = false;
        return;
      }

      // Non-ShurjoPay → go to confirmation directly
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error("Error placing order:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mt-42 ">
        <HeroText title="Checkout" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 md:py-12">
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-xs sm:text-sm font-medium">
              {error}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:gap-12">
          {/* Billing Details */}
          <div className="flex-1">
            <BillingForm
              ref={billingFormRef}
              formData={formData}
              updateField={updateField}
              eventType={eventType}
              raceFields={raceFields}
            />
            {/* Non-marathon events: their own questions (company, guests …) */}
            <EventQuestions
              title={`${getEventCategory(category).label.split(" /")[0]} details`}
              questions={extraQuestions}
              answers={extraAnswers}
              errors={extraErrors}
              onChange={updateExtraAnswer}
            />
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[450px]">
            <OrderSummary
              item={item}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onPlaceOrder={handlePlaceOrder}
              loading={loading}
              isFormValid={isFormValid}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              finalPrice={finalPrice}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
