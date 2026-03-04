import { adminDb } from "@/lib/firebase-admin"
import { logger } from "@/lib/logger"

// ============================================================
// BUILT-IN CAMEROONIAN LAW KNOWLEDGE BASE
// These are embedded directly in the app — no internet needed
// ============================================================

export interface KnowledgeEntry {
  id: string
  category: "statute" | "case_law" | "procedure" | "contract_template" | "legal_principle" | "regulation"
  title: string
  content: string
  tags: string[]
  jurisdiction: string
  source?: string
  lastUpdated?: string
}

// ── Cameroonian Legal Framework ──
const CAMEROONIAN_STATUTES: KnowledgeEntry[] = [
  {
    id: "cm-constitution",
    category: "statute",
    title: "Constitution of the Republic of Cameroon (1996, as amended 2008)",
    content: `The Constitution of Cameroon establishes the fundamental legal framework of the Republic.

KEY PROVISIONS:
- Preamble: Affirms commitment to fundamental freedoms enshrined in the Universal Declaration of Human Rights, UN Charter, and African Charter on Human and Peoples' Rights.
- Article 1: Cameroon is a unitary decentralised Republic. It is one and indivisible, secular, democratic, and dedicated to social service. The official languages are English and French.
- Article 2: National sovereignty belongs to the people who exercise it through elected representatives or by referendum.
- Article 26: The President of the Republic is the Head of State and Commander-in-Chief of the Armed Forces. Elected for a 7-year term, renewable.
- Article 37: Legislative power is exercised by the National Assembly and the Senate.
- Part XI: Establishes the Constitutional Council to rule on the constitutionality of laws.
- Part XII: Establishes the judicial power as independent from the executive and legislative powers.

BILINGUAL LEGAL SYSTEM:
Cameroon operates a bijural system — Common Law applies in the two Anglophone regions (Northwest and Southwest), while Civil Law (derived from French law) applies in the eight Francophone regions. Federal-level laws apply throughout.`,
    tags: ["constitution", "fundamental law", "human rights", "government structure", "bilingual"],
    jurisdiction: "Cameroon - National",
    source: "Law No. 96-06 of 18 January 1996, as amended by Law No. 2008/001 of 14 April 2008",
    lastUpdated: "2008-04-14"
  },
  {
    id: "cm-ohada",
    category: "statute",
    title: "OHADA Uniform Acts (Organisation for the Harmonization of Business Law in Africa)",
    content: `Cameroon is a member of OHADA. OHADA Uniform Acts have direct applicability and override conflicting national laws on commercial matters.

KEY UNIFORM ACTS APPLICABLE IN CAMEROON:
1. Uniform Act on General Commercial Law (AUDCG) — governs commercial status, commercial sales, intermediaries, and commercial leases.
2. Uniform Act on Commercial Companies and Economic Interest Groups (AUSCGIE) — regulates formation, operation, and dissolution of companies (SA, SARL, SAS, SNC, etc.).
3. Uniform Act on Secured Transactions (AUS) — governs pledges, mortgages, security interests.
4. Uniform Act on Simplified Recovery Procedures and Enforcement Measures (AUPSRVE) — covers injunctions to pay, attachments, seizures.
5. Uniform Act on Collective Insolvency Proceedings (AUPC) — bankruptcy, judicial liquidation, preventive settlement.
6. Uniform Act on Arbitration (AUA) — rules for commercial arbitration.
7. Uniform Act on Accounting Law (AUSF) — standardised accounting rules (SYSCOHADA).
8. Uniform Act on Carriage of Goods by Road (AUCTMR).
9. Uniform Act on Cooperative Societies (AUSC).
10. Uniform Act on Mediation (2017).

COMPANY FORMATION UNDER OHADA:
- SARL (Limited Liability Company): Minimum capital of 100,000 FCFA; minimum 1 partner.
- SA (Public Limited Company): Minimum capital of 10,000,000 FCFA; minimum 1 shareholder.
- SAS (Simplified Joint Stock Company): Flexible governance; minimum capital of 100,000 FCFA.

These Acts supersede conflicting provisions in Cameroon's domestic Commercial Code.`,
    tags: ["ohada", "business law", "commercial law", "company formation", "SARL", "SA", "arbitration"],
    jurisdiction: "Cameroon / OHADA Zone",
    source: "OHADA Treaty of Port Louis (1993), revised 2008",
    lastUpdated: "2023-01-01"
  },
  {
    id: "cm-labour-code",
    category: "statute",
    title: "Cameroon Labour Code (Law No. 92/007 of 14 August 1992)",
    content: `The Labour Code governs employment relationships in Cameroon.

KEY PROVISIONS:
- Employment Contracts: Must be in writing for fixed-term contracts. Indefinite contracts may be oral but written is recommended.
- Probation Period: Maximum 6 months for workers, 8 months for supervisors/executives.
- Working Hours: 40 hours per week (general), 48 hours for agricultural workers. Overtime paid at 120% (first 8 hours) and 140% (beyond 8 hours).
- Annual Leave: 1.5 working days per month of service (18 days per year). Additional days for seniority.
- Dismissal:
  * Notice period: 1 month (1-5 years service), 2 months (6-10 years), 3 months (10+ years).
  * Severance pay (indemnite de licenciement): 20-40% of average monthly salary per year of service.
  * Wrongful dismissal: damages determined by court.
- Maternity Leave: 14 weeks (6 weeks before, 8 weeks after delivery). Paid by CNPS at 100%.
- Social Security: Managed by CNPS (Caisse Nationale de Prevoyance Sociale). Employer contributions: ~18.5% of gross salary.
- Trade Unions: Freedom to form and join unions is guaranteed.
- Labour Inspection: Ministry of Labour oversees compliance.
- Labour Courts: Specialised courts handle employment disputes.`,
    tags: ["labour", "employment", "contracts", "dismissal", "CNPS", "maternity", "working hours"],
    jurisdiction: "Cameroon - National",
    source: "Law No. 92/007 of 14 August 1992",
    lastUpdated: "1992-08-14"
  },
  {
    id: "cm-penal-code",
    category: "statute",
    title: "Cameroon Penal Code (Law No. 2016/007 of 12 July 2016)",
    content: `The Penal Code defines criminal offences and penalties in Cameroon.

KEY CATEGORIES:
- Felonies (Crimes): Punishable by death or imprisonment over 10 years. Examples: murder, armed robbery, treason.
- Misdemeanours (Delits): Imprisonment from 10 days to 10 years and/or fines over 25,000 FCFA.
- Simple Offences (Contraventions): Imprisonment up to 10 days and/or fines up to 25,000 FCFA.

NOTABLE PROVISIONS:
- Article 74: Corruption of public officials — 5-10 years imprisonment.
- Article 77: Embezzlement of public funds — up to life imprisonment for amounts over 500 million FCFA.
- Article 275: Theft — 5-10 years imprisonment.
- Article 277: Aggravated theft — 10-20 years.
- Article 289: Fraud/swindling — 1-5 years imprisonment.
- Article 337: Defamation — up to 2 years and/or fines.
- Drug offences governed by Law No. 97/019, penalties up to life imprisonment.

CRIMINAL PROCEDURE:
- Investigation: By judicial police officers under supervision of State Counsel.
- Prosecution: Initiated by State Counsel (Procureur de la Republique).
- Courts: Magistrate's Courts, High Courts, Court of Appeal, Supreme Court.
- Bail: Available for misdemeanours, restricted for felonies.`,
    tags: ["criminal law", "penal code", "felony", "theft", "corruption", "criminal procedure"],
    jurisdiction: "Cameroon - National",
    source: "Law No. 2016/007 of 12 July 2016",
    lastUpdated: "2016-07-12"
  },
  {
    id: "cm-land-tenure",
    category: "statute",
    title: "Cameroon Land Tenure (Ordinance No. 74-1 of 6 July 1974)",
    content: `Land law in Cameroon is governed primarily by Ordinance No. 74-1 of 6 July 1974.

LAND CATEGORIES:
1. Registered Land: Land with a land certificate (titre foncier) — the only absolute proof of ownership.
2. National Lands: All land not classified as private or public property. Divided into:
   - Occupied national lands (under customary tenure)
   - Unoccupied national lands
3. Public Property: Roads, waterways, public buildings (inalienable).
4. Private Property of the State: Land acquired by the state.

OBTAINING A LAND CERTIFICATE:
1. File application with the Regional Land Consultative Board.
2. Include survey plan by a sworn land surveyor.
3. Publication in the official gazette (30-day opposition period).
4. Investigation by the Lands Advisory Commission.
5. Issuance by the Minister of State Property and Land Tenure.

CUSTOMARY LAND RIGHTS:
- Customary occupants may apply to convert their rights to a registered title.
- Communities occupy and use national lands based on custom, but do not have formal ownership without registration.

COMMON DISPUTES:
- Double sale of land.
- Boundary disputes.
- Fraudulent land certificates.
- Conflicts between customary and statutory tenure systems.

Recent amendments encourage registration and formalisation of land holdings.`,
    tags: ["land law", "property", "land certificate", "titre foncier", "customary tenure", "national lands"],
    jurisdiction: "Cameroon - National",
    source: "Ordinance No. 74-1 of 6 July 1974, Decree No. 76-165 of 27 April 1976",
    lastUpdated: "1976-04-27"
  },
  {
    id: "cm-family-law",
    category: "statute",
    title: "Cameroon Family Law (Civil Status Registration Ordinance & Civil Code)",
    content: `Family law in Cameroon draws from both Civil Code provisions and customary law.

MARRIAGE:
- Civil marriage is the only legally recognized form. Minimum age: 18 for men, 15 for women (with parental consent).
- Matrimonial regimes: Community of property (default), separate property, or contractual regime (chosen by prenuptial contract before a notary).
- Polygamy: Allowed under customary law; optional under civil law if chosen at time of marriage.
- Bride price (dot): Recognized in customary marriage but civil marriage does not require it.

DIVORCE:
- Grounds: Adultery, cruelty, abandonment, imprisonment (5+ years), mutual consent.
- Procedure: Filed at the High Court. Attempted reconciliation required.
- Custody: Best interest of the child standard. Preference often given to mother for young children.
- Alimony: May be awarded to the disadvantaged spouse.

SUCCESSION / INHERITANCE:
- Intestate succession: Governed by custom in many cases. Under civil law, surviving spouse and children share the estate.
- Wills: Must be notarised or holographic (handwritten, dated, signed).
- Forced heirship rules apply (children cannot be fully disinherited).

CHILD LAW:
- Children's rights protected under Law No. 2005/015.
- Adoption: Governed by civil code; international adoption subject to Hague Convention rules.`,
    tags: ["family law", "marriage", "divorce", "inheritance", "succession", "custody", "child law"],
    jurisdiction: "Cameroon - National",
    source: "Civil Code, Ordinance No. 81-02 of 29 June 1981",
    lastUpdated: "2005-12-01"
  },
  {
    id: "cm-tax-law",
    category: "statute",
    title: "Cameroon Tax Law (General Tax Code)",
    content: `Taxation in Cameroon is governed by the General Tax Code (Code General des Impots), updated annually via the Finance Law.

KEY TAXES:
1. Corporate Income Tax (IS): 33% (30% + 10% council surtax).
2. Personal Income Tax (IRPP): Progressive rates from 10% to 35%.
3. Value Added Tax (VAT/TVA): Standard rate 19.25% (17.5% + 10% council surtax).
4. Withholding Tax: 5.5% on service payments, 16.5% on dividends.
5. Registration/Stamp Duties: Apply to transfers of property, contracts, and legal acts.
6. Business License Tax (Patente): Annual tax based on company turnover.

TAX INCENTIVES:
- Investment Charter (Law No. 2013/004): Tax holidays for 5-10 years for investments in priority sectors.
- Free Trade Zones: Reduced tax rates for qualifying businesses.
- SME incentives: Reduced rates for small enterprises.

TAX ADMINISTRATION:
- The Directorate General of Taxation (DGI) administers taxes.
- Large Taxpayer Unit handles major enterprises.
- Tax disputes resolved through administrative review, then Tax Court.
- Filing deadlines: Monthly VAT returns by 15th, annual returns by March 15.

PENALTIES:
- Late filing: 10% surcharge + 1.5% monthly interest.
- Tax fraud: Criminal penalties up to 5 years imprisonment.`,
    tags: ["tax", "corporate tax", "VAT", "income tax", "investment", "finance law"],
    jurisdiction: "Cameroon - National",
    source: "General Tax Code (Code General des Impots), Finance Law 2024",
    lastUpdated: "2024-01-01"
  },
]

const CAMEROONIAN_PROCEDURES: KnowledgeEntry[] = [
  {
    id: "cm-court-system",
    category: "procedure",
    title: "Cameroon Court System and Judicial Hierarchy",
    content: `COURT HIERARCHY (bottom to top):
1. Customary Courts / Courts of First Instance — handle minor civil & criminal matters, customary disputes.
2. High Courts (Tribunal de Grande Instance) — civil, commercial, and criminal matters of greater value/severity.
3. Courts of Appeal (Cour d'Appel) — 10 regional courts handling appeals from lower courts.
4. Supreme Court (Cour Supreme) — highest court of appeal, with Judicial, Administrative, and Audit divisions.
5. Constitutional Council — rules on constitutionality of laws and election disputes.

SPECIAL COURTS:
- Military Tribunal — offences by military personnel and national security matters.
- Special Criminal Court (TCS) — embezzlement of public funds exceeding 50 million FCFA.
- Administrative Courts — disputes involving the state or public bodies.
- Labour Courts — employment disputes.

ANGLOPHONE vs. FRANCOPHONE COURTS:
- Common Law procedures in NW and SW regions (adversarial, precedent-based).
- Civil Law procedures in 8 Francophone regions (inquisitorial, code-based).

FILING A CASE:
1. Consult a lawyer or legal aid organisation.
2. Draft and file a complaint (plainte/requete) at the appropriate court registry.
3. Pay court fees.
4. Service of process to the defendant.
5. Pre-trial hearing / attempted mediation.
6. Trial proceedings.
7. Judgment.
8. Appeal within 30 days (civil) or 10 days (criminal) of judgment.`,
    tags: ["courts", "judiciary", "procedure", "appeal", "anglophone", "francophone"],
    jurisdiction: "Cameroon - National",
    source: "Law No. 2006/015 on Judicial Organisation",
    lastUpdated: "2006-12-29"
  },
  {
    id: "cm-business-registration",
    category: "procedure",
    title: "Business Registration Procedure in Cameroon (CFCE)",
    content: `Business registration in Cameroon is handled through the Centre de Formalites de Creation des Entreprises (CFCE).

STEPS TO REGISTER A BUSINESS:
1. Choose business form (sole proprietorship, SARL, SA, SAS, etc.)
2. Reserve company name at CFCE.
3. Prepare formation documents:
   - Articles of Association (statuts) drafted by notary
   - Declaration of subscription and payment of shares
   - List of managers/directors
4. Deposit capital at a bank (SARL: minimum 100,000 FCFA; SA: 10,000,000 FCFA).
5. File all documents at CFCE — one-stop shop that handles:
   - Trade register (RCCM) registration
   - Tax registration (NIU — Numero d'Identifiant Unique)
   - Social security (CNPS) registration
   - Publication in legal gazette
6. Obtain business licence (patente).
7. Processing time: Officially 72 hours, practically 1-2 weeks.

COSTS (approximate):
- Notary fees: 150,000 - 500,000 FCFA
- CFCE fees: 41,500 FCFA (SARL), 67,500 FCFA (SA)
- Publication: 50,000 FCFA
- Total estimated: 300,000 - 800,000 FCFA depending on complexity.

POST-REGISTRATION OBLIGATIONS:
- Annual financial statements filed at court registry.
- Monthly tax returns (VAT, withholding tax).
- Annual corporate tax return.
- CNPS contributions for employees.`,
    tags: ["business registration", "CFCE", "company formation", "SARL", "RCCM", "tax registration"],
    jurisdiction: "Cameroon - National",
    source: "Law No. 2016/014, OHADA AUSCGIE",
    lastUpdated: "2016-12-01"
  },
]

const CONTRACT_TEMPLATES: KnowledgeEntry[] = [
  {
    id: "cm-employment-contract",
    category: "contract_template",
    title: "Employment Contract Template (Cameroon)",
    content: `CONTRACT OF EMPLOYMENT
(Under Cameroon Labour Code - Law No. 92/007)

BETWEEN:
Employer: [Company Name], registered at RCCM [Number], NIU [Number], represented by [Name], [Title]
(Hereinafter "the Employer")

AND:
Employee: [Full Name], born on [Date] at [Place], holder of CNI No. [Number], residing at [Address]
(Hereinafter "the Employee")

IT IS AGREED AS FOLLOWS:

Article 1 - ENGAGEMENT
The Employer engages the Employee effective [Start Date] for the position of [Job Title], Category [X], Grade [Y] under the National Collective Agreement for the [sector] sector.

Article 2 - NATURE AND DURATION
[] Indefinite duration (CDI)
[] Fixed duration (CDD) of [Duration], from [Start Date] to [End Date], renewable [X] times.

Article 3 - PROBATION PERIOD
The first [3/6] months constitute a probation period, renewable once with written notice, during which either party may terminate the contract with [X days] notice.

Article 4 - DUTIES
The Employee shall perform the following duties: [Description of duties]. The Employee may be required to perform other reasonable tasks consistent with their qualification and grade.

Article 5 - PLACE OF WORK
[City/Region]. The Employer reserves the right to transfer the Employee to another location with reasonable notice and in accordance with the Labour Code.

Article 6 - REMUNERATION
- Basic monthly salary: [Amount] FCFA
- Housing allowance: [Amount] FCFA
- Transport allowance: [Amount] FCFA
- Other benefits: [Specify]
Salary is paid monthly by [bank transfer/cheque] no later than the 5th of the following month.

Article 7 - WORKING HOURS
[40] hours per week, [Monday to Friday / as scheduled]. Overtime is compensated per Labour Code provisions (120% for first 8 excess hours, 140% thereafter).

Article 8 - ANNUAL LEAVE
The Employee is entitled to 1.5 working days per month of service. Additional seniority leave per Labour Code.

Article 9 - SOCIAL SECURITY
The Employer shall register the Employee with CNPS and make all required contributions.

Article 10 - CONFIDENTIALITY
The Employee shall not disclose proprietary information during or after employment.

Article 11 - TERMINATION
Either party may terminate with written notice as required by law. Grounds for dismissal without notice: gross misconduct as defined by Articles 130-131 of the Labour Code.

Article 12 - APPLICABLE LAW
This contract is governed by Cameroon Labour Code (Law No. 92/007) and the applicable Collective Agreement.

Done in two originals at [City], on [Date].

Employer: _______________     Employee: _______________
Name & Stamp                  Name & Signature`,
    tags: ["employment contract", "labour", "CDI", "CDD", "template"],
    jurisdiction: "Cameroon - National",
    source: "Based on Cameroon Labour Code, Law No. 92/007",
    lastUpdated: "2024-01-01"
  },
  {
    id: "cm-lease-agreement",
    category: "contract_template",
    title: "Residential Lease Agreement Template (Cameroon)",
    content: `RESIDENTIAL LEASE AGREEMENT (BAIL D'HABITATION)
(Under Cameroon Law and OHADA Uniform Act on General Commercial Law)

BETWEEN:
Landlord: [Full Name], CNI No. [Number], residing at [Address]
(Hereinafter "the Landlord")

AND:
Tenant: [Full Name], CNI No. [Number], residing at [Address]
(Hereinafter "the Tenant")

RECITALS:
The Landlord is the owner of property located at [Full Address], consisting of [description], covered by Land Certificate No. [Number].

Article 1 - OBJECT
The Landlord hereby leases to the Tenant the above-described premises for residential use exclusively.

Article 2 - DURATION
This lease is entered into for a period of [1 year / X years], commencing on [Start Date] and ending on [End Date]. It is renewable by tacit agreement unless terminated with [3 months] written notice.

Article 3 - RENT
Monthly rent: [Amount] FCFA, payable in advance by the [5th] of each month. Payment by [cash/bank transfer] to [account/address].

Article 4 - SECURITY DEPOSIT (CAUTION)
The Tenant shall pay a security deposit of [2-4 months rent] = [Amount] FCFA upon signing, refundable at end of lease minus any deductions for damage or unpaid rent.

Article 5 - CHARGES
- Water/electricity: [] Included [] Tenant's responsibility
- Maintenance of common areas: [] Included [] Tenant's responsibility
- Property tax: Landlord's responsibility.

Article 6 - TENANT'S OBLIGATIONS
a) Pay rent on time.
b) Use the premises for residential purposes only.
c) Maintain the premises in good condition.
d) Not sublet or assign without written consent.
e) Not make structural modifications without written consent.
f) Allow the Landlord reasonable access for inspections with 24-hour notice.

Article 7 - LANDLORD'S OBLIGATIONS
a) Deliver the premises in good condition.
b) Maintain the structural elements and major installations.
c) Ensure peaceful enjoyment of the premises.
d) Provide a receipt for each rent payment.

Article 8 - TERMINATION
- By Tenant: 3 months written notice.
- By Landlord: 6 months written notice. Valid grounds: non-payment of rent (after formal demand), damage to property, personal use.
- Eviction requires court order.

Article 9 - APPLICABLE LAW
This agreement is governed by Cameroon law and applicable OHADA provisions.

Done in two originals at [City], on [Date].

Landlord: _______________     Tenant: _______________`,
    tags: ["lease", "rental", "residential", "bail", "property", "template"],
    jurisdiction: "Cameroon - National",
    source: "Cameroon Civil Code, OHADA AUDCG",
    lastUpdated: "2024-01-01"
  },
  {
    id: "cm-sale-agreement",
    category: "contract_template",
    title: "Sale of Goods Agreement Template (Cameroon/OHADA)",
    content: `AGREEMENT FOR THE SALE OF GOODS
(Under OHADA Uniform Act on General Commercial Law - AUDCG)

BETWEEN:
Seller: [Company/Name], RCCM [Number], NIU [Number], represented by [Name]
(Hereinafter "the Seller")

AND:
Buyer: [Company/Name], RCCM [Number], NIU [Number], represented by [Name]
(Hereinafter "the Buyer")

Article 1 - OBJECT OF SALE
The Seller agrees to sell and the Buyer agrees to purchase the following goods:
[Detailed description, quantity, specifications, reference numbers]

Article 2 - PRICE
Total price: [Amount] FCFA, [inclusive/exclusive] of VAT at 19.25%.
Payment terms: [Full payment on delivery / 50% advance, 50% on delivery / 30-day credit].

Article 3 - DELIVERY
Delivery date: [Date or within X days of order confirmation].
Delivery location: [Address].
Delivery terms: [Ex-works / FOB / CIF per Incoterms 2020].
Risk transfers to Buyer upon [delivery/acceptance].

Article 4 - INSPECTION AND ACCEPTANCE
The Buyer shall inspect goods within [5] business days of delivery. Any defects must be notified in writing within this period.

Article 5 - WARRANTIES
The Seller warrants that:
a) Goods conform to agreed specifications.
b) Goods are free from defects in materials and workmanship.
c) The Seller has full right to sell the goods.
Warranty period: [6/12] months from delivery.

Article 6 - LIABILITY
Liability is limited to the contract value. Neither party is liable for indirect or consequential damages.

Article 7 - FORCE MAJEURE
Neither party is liable for failure caused by events beyond reasonable control (war, natural disaster, government action, epidemic).

Article 8 - DISPUTE RESOLUTION
Disputes shall be resolved by:
[] Mediation, then arbitration under OHADA Arbitration Act.
[] The courts of [City], Cameroon.

Article 9 - APPLICABLE LAW
This agreement is governed by OHADA Uniform Act on General Commercial Law and Cameroon law.

Done in two originals at [City], on [Date].

Seller: _______________     Buyer: _______________`,
    tags: ["sale", "goods", "commercial", "OHADA", "AUDCG", "template"],
    jurisdiction: "Cameroon / OHADA Zone",
    source: "OHADA AUDCG",
    lastUpdated: "2024-01-01"
  },
  {
    id: "cm-service-agreement",
    category: "contract_template",
    title: "Service Agreement Template (Cameroon)",
    content: `SERVICE AGREEMENT / CONTRAT DE PRESTATION DE SERVICES

BETWEEN:
Service Provider: [Company/Name], RCCM [Number], NIU [Number]
(Hereinafter "the Provider")

AND:
Client: [Company/Name], RCCM [Number], NIU [Number]
(Hereinafter "the Client")

Article 1 - SCOPE OF SERVICES
The Provider agrees to perform the following services: [Detailed description of services, deliverables, milestones].

Article 2 - DURATION
From [Start Date] to [End Date]. May be extended by written agreement.

Article 3 - COMPENSATION
Total fee: [Amount] FCFA [plus VAT at 19.25% if applicable].
Payment schedule: [Describe milestones or monthly payments].
Invoices payable within [30] days of receipt.
Note: Client must withhold 5.5% IRCM (withholding tax) on service payments and remit to tax authorities.

Article 4 - OBLIGATIONS OF THE PROVIDER
a) Perform services professionally and diligently.
b) Meet agreed deadlines.
c) Maintain confidentiality.
d) Comply with applicable laws and regulations.

Article 5 - OBLIGATIONS OF THE CLIENT
a) Provide necessary information and access.
b) Make timely payments.
c) Review and approve deliverables within [X] business days.

Article 6 - INTELLECTUAL PROPERTY
All deliverables created under this agreement are the property of [] the Client / [] the Provider, licensed to the Client for [specified use].

Article 7 - TERMINATION
Either party may terminate with [30] days written notice. Termination for cause (material breach) effective immediately upon written notice if not cured within [15] days.

Article 8 - LIABILITY AND INDEMNIFICATION
The Provider's liability is limited to the total fees paid. Each party indemnifies the other against third-party claims arising from its breach.

Article 9 - DISPUTE RESOLUTION
[] Amicable settlement, then arbitration under CCJA (OHADA).
[] Courts of [City], Cameroon.

Article 10 - APPLICABLE LAW
Governed by Cameroon law and applicable OHADA provisions.

Done in two originals at [City], on [Date].

Provider: _______________     Client: _______________`,
    tags: ["service agreement", "freelance", "consulting", "template", "prestation"],
    jurisdiction: "Cameroon - National",
    source: "Cameroon Civil Code, OHADA",
    lastUpdated: "2024-01-01"
  },
  {
    id: "cm-nda",
    category: "contract_template",
    title: "Non-Disclosure Agreement (NDA) Template (Cameroon)",
    content: `NON-DISCLOSURE AGREEMENT / ACCORD DE CONFIDENTIALITE

BETWEEN:
Disclosing Party: [Name/Company], [Address]
(Hereinafter "the Disclosing Party")

AND:
Receiving Party: [Name/Company], [Address]
(Hereinafter "the Receiving Party")

RECITALS:
The parties wish to explore a potential business relationship regarding [describe purpose]. In connection with this, the Disclosing Party may share confidential information with the Receiving Party.

Article 1 - DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" includes all non-public information disclosed by the Disclosing Party, whether orally, in writing, or electronically, including but not limited to: business plans, financial data, client lists, technical data, trade secrets, and proprietary processes.

Article 2 - OBLIGATIONS
The Receiving Party agrees to:
a) Hold all Confidential Information in strict confidence.
b) Not disclose it to any third party without prior written consent.
c) Use it solely for the stated purpose.
d) Take reasonable measures to protect its confidentiality.
e) Return or destroy all copies upon request or termination.

Article 3 - EXCLUSIONS
This obligation does not apply to information that:
a) Was already known to the Receiving Party.
b) Is or becomes publicly available through no fault of the Receiving Party.
c) Is independently developed by the Receiving Party.
d) Is disclosed pursuant to a court order or legal requirement (with prior notice to Disclosing Party).

Article 4 - DURATION
This Agreement is effective for [2/3/5] years from the date of signing.

Article 5 - REMEDIES
The Receiving Party acknowledges that breach may cause irreparable harm. The Disclosing Party is entitled to seek injunctive relief and damages.

Article 6 - APPLICABLE LAW
Governed by the laws of Cameroon. Disputes submitted to the courts of [City].

Done in two originals at [City], on [Date].

Disclosing Party: _______________     Receiving Party: _______________`,
    tags: ["NDA", "confidentiality", "non-disclosure", "trade secret", "template"],
    jurisdiction: "Cameroon - National",
    source: "Cameroon Civil Code",
    lastUpdated: "2024-01-01"
  },
]

const CASE_LAW: KnowledgeEntry[] = [
  {
    id: "cm-case-law-principles",
    category: "case_law",
    title: "Key Principles from Cameroonian Case Law",
    content: `LANDMARK PRINCIPLES FROM CAMEROONIAN JURISPRUDENCE:

1. LAND CERTIFICATE IS INDEFEASIBLE
The Supreme Court has consistently held that a duly issued land certificate (titre foncier) constitutes the only indefeasible proof of land ownership. Third-party claims against registered land must be resolved by attacking the certificate through proper legal channels (action en revendication).

2. PROTECTIVE PRINCIPLE IN EMPLOYMENT LAW
Courts have interpreted the Labour Code protectively in favour of workers. Burden of proof for just cause dismissal lies with the employer. Failure to follow proper termination procedure renders dismissal abusive.

3. OHADA SUPREMACY
The CCJA (Common Court of Justice and Arbitration) decisions are binding. National courts must apply OHADA Uniform Acts, and conflicting national laws are automatically superseded.

4. FUNDAMENTAL RIGHTS
The Constitutional Council and courts have upheld the right to fair trial, freedom of expression, and due process as guaranteed by the Constitution's Preamble, which incorporates international human rights instruments.

5. CUSTOMARY LAW AND MARRIAGE
Courts recognise customary marriage where properly celebrated, but civil marriage takes precedence in case of conflict. Bride price disputes must be resolved under custom of the community concerned.

6. ADMINISTRATIVE LIABILITY
The state can be held liable for damages caused by its agents in the exercise of their functions (faute de service). Administrative courts have jurisdiction.

7. COMMERCIAL DISPUTES — SUMMARY PROCEEDINGS
Under OHADA, the judge in chambers (juge des referes) can order provisional measures in urgent commercial disputes (Article 49 AUPSRVE).`,
    tags: ["case law", "jurisprudence", "precedent", "supreme court", "principles"],
    jurisdiction: "Cameroon - National",
    source: "Various Supreme Court and CCJA Decisions",
    lastUpdated: "2024-01-01"
  },
]

// ═══════════════════════════════════════════
// KNOWLEDGE BASE SERVICE
// ═══════════════════════════════════════════

// Combine all built-in knowledge
const ALL_KNOWLEDGE: KnowledgeEntry[] = [
  ...CAMEROONIAN_STATUTES,
  ...CAMEROONIAN_PROCEDURES,
  ...CONTRACT_TEMPLATES,
  ...CASE_LAW,
]

/**
 * Search the built-in knowledge base by keywords and/or category
 */
export function searchKnowledgeBase(
  searchQuery: string,
  category?: KnowledgeEntry["category"],
  maxResults: number = 5
): KnowledgeEntry[] {
  const normalizedQuery = searchQuery.toLowerCase()
  const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)

  let entries = category
    ? ALL_KNOWLEDGE.filter(e => e.category === category)
    : ALL_KNOWLEDGE

  // Score each entry by relevance
  const scored = entries.map(entry => {
    let score = 0
    const searchable = `${entry.title} ${entry.content} ${entry.tags.join(" ")}`.toLowerCase()

    for (const word of queryWords) {
      if (searchable.includes(word)) score += 1
      if (entry.title.toLowerCase().includes(word)) score += 3
      if (entry.tags.some(t => t.includes(word))) score += 2
    }

    return { entry, score }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.entry)
}

/**
 * Get all contract templates
 */
export function getContractTemplates(): KnowledgeEntry[] {
  return ALL_KNOWLEDGE.filter(e => e.category === "contract_template")
}

/**
 * Get knowledge base context string for AI prompt injection
 */
export function getKnowledgeContext(
  searchQuery: string,
  category?: KnowledgeEntry["category"]
): string {
  const entries = searchKnowledgeBase(searchQuery, category, 3)

  if (entries.length === 0) return ""

  let context = "\n\n=== KNOWLEDGE BASE (Offline Cameroonian Legal Resources) ===\n"
  for (const entry of entries) {
    context += `\n--- ${entry.title} ---\n`
    context += `Source: ${entry.source || "N/A"}\n`
    context += `${entry.content}\n`
  }
  context += "\n=== END KNOWLEDGE BASE ===\n"

  return context
}

/**
 * Fetch user-uploaded knowledge base documents from Firestore (Admin SDK)
 */
export async function fetchFirestoreKnowledge(
  searchQuery: string,
  category?: string,
  maxResults: number = 3
): Promise<KnowledgeEntry[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = adminDb.collection("knowledge_base")
      .orderBy("createdAt", "desc")

    if (category) {
      q = q.where("category", "==", category).limit(maxResults)
    } else {
      q = q.limit(maxResults * 2)
    }

    const snapshot = await q.get()
    const entries: KnowledgeEntry[] = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    } as KnowledgeEntry))

    // Basic keyword filtering for user-uploaded docs
    if (searchQuery) {
      const words = searchQuery.toLowerCase().split(/\s+/)
      return entries.filter(e => {
        const text = `${e.title} ${e.content} ${e.tags?.join(" ")}`.toLowerCase()
        return words.some(w => text.includes(w))
      }).slice(0, maxResults)
    }

    return entries.slice(0, maxResults)
  } catch (error) {
    logger.error("Error fetching Firestore knowledge base:", error)
    return []
  }
}

/**
 * Get combined context from built-in + Firestore sources
 */
export async function getCombinedKnowledgeContext(
  searchQuery: string,
  category?: KnowledgeEntry["category"]
): Promise<string> {
  // Built-in knowledge (always available, no internet needed)
  const builtInContext = getKnowledgeContext(searchQuery, category)

  // Firestore knowledge (user/admin uploaded documents)
  let firestoreContext = ""
  try {
    const firestoreEntries = await fetchFirestoreKnowledge(searchQuery, category)
    if (firestoreEntries.length > 0) {
      firestoreContext = "\n\n=== UPLOADED RESOURCES ===\n"
      for (const entry of firestoreEntries) {
        firestoreContext += `\n--- ${entry.title} ---\n${entry.content}\n`
      }
      firestoreContext += "\n=== END UPLOADED RESOURCES ===\n"
    }
  } catch {
    // Firestore may be unavailable offline — that's ok, built-in knowledge still works
  }

  return builtInContext + firestoreContext
}
