// module/legal/pages/PrivacyPolicyPage.tsx
//
// /privacy-policy — cream header, then the policy with a contents list.
// Wording: ../components/PrivacyPolicyContent.tsx
// Shared look (also Terms & Conditions): ../components/legal-ui.tsx

import { LegalHeader, LegalPage } from "../components/legal-ui";
import PrivacyPolicyContent from "../components/PrivacyPolicyContent";

const PrivacyPolicyPage = () => {
  return (
    <LegalPage>
      <LegalHeader
        crumb="Privacy Policy"
        title="Privacy"
        italic="policy"
        intro="Your privacy matters to us. Here's what we collect when you register for an event, why, and how we keep it safe."
        lastUpdated="January 15, 2026"
      />
      <PrivacyPolicyContent />
    </LegalPage>
  );
};

export default PrivacyPolicyPage;
