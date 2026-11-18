// module/legal/pages/TermsAndConditionsPage.tsx
//
// /terms-and-conditions — cream header, then the terms with a contents list.
// Wording: ../components/TermsAndConditionsContent.tsx
// Shared look (also the Privacy Policy): ../components/legal-ui.tsx

import { LegalHeader, LegalPage } from "../components/legal-ui";
import TermsAndConditionsContent from "../components/TermsAndConditionsContent";

const TermsAndConditionsPage = () => {
  return (
    <LegalPage>
      <LegalHeader
        crumb="Terms & Conditions"
        title="Terms &"
        italic="conditions"
        intro="The rules for registering for and taking part in our marathon events — please read them before you buy a ticket."
        lastUpdated="January 15, 2026"
      />
      <TermsAndConditionsContent />
    </LegalPage>
  );
};

export default TermsAndConditionsPage;
