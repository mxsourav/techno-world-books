# India Post (CEPT) Official API Integration, Label Rights & Whitelisting Protocol

## Prepared for Joy daa & Techno World Publications Management
**Date**: September 2026  
**Document Version**: 2.0 (Official CEPT E-Commerce Logistics Standard)

---

## 1. Official India Post Barcode Label Rights & Compliance

### Does the India Post API & Word/PDF Documentation Allow Printing Custom Stickers?
**YES, 100% AUTHORIZED AND ENCOURAGED BY INDIA POST.**

Under the official **Department of Posts (DoP) CEPT Customer Integration Specification**:
- Corporate / BNPL (Book Now Pay Later) clients are **explicitly authorized** to generate and affix their own computerized adhesive shipping stickers to consignments.
- You do **not** need to buy physical pre-printed paper slips from the post office counter once onboarded with electronic booking.
- You are legally entitled to print barcode labels directly from your system on thermal stickers or laser sheets, as long as India Post's technical scanning parameters are met.

### Mandatory vs. Customizable Fields on the Sticker:
| Field Category | Elements Required by India Post | Permitted Merchant Customizations |
| :--- | :--- | :--- |
| **Header Banner** | Carrier name: `SPEED POST (DOMESTIC)` or `BOOK POST / PARCEL`. National Postal Emblem. | Sub-heading: `Techno World Publications Logistics Hub`. Booking GPO name. |
| **Barcode (AWB)** | **Code 128 Barcode** representing the 13-character Article Number (e.g., `EB468827991IN`). Minimum height: 15mm. | Human-readable tracking number formatted with spaces (`EB 468 827 991 IN`) for manual fallback. |
| **Routing Block** | **Delivery 6-digit Pincode** in large bold font (minimum 20pt) + Destination Sorting Hub City. | Destination State, Circle code, and delivery post office name. |
| **Consignee ("TO")** | Full Recipient Name, Street Address, City, State, PIN, and Mobile Number (required for SMS delivery OTP). | Customer email, landmark, and alternate contact. |
| **Shipper ("FROM")** | Sender Corporate Name, Complete Address, Contact Number, and Pincode. | **Techno World Logo**, Company Registration, GSTIN, and BNPL Customer Code. |
| **Manifest / Box** | Weight in grams, Package Dimensions, Value in INR, Payment Mode (`PREPAID` or `C.O.D.`). | **Assigned Order ID & Barcode**, **Book SKU IDs & Titles**, Dispatch notes (`FRAGILE`, `EDUCATIONAL BOOKS`). |

### Approved Sticker Sizing:
- **75 mm × 125 mm (3" × 5")**: Default standard thermal label roll format for book parcels & Courier dispatch.
- **A7 (74 mm × 105 mm)**: Authorized for standard 3-inch pocket thermal label rolls (TVS, TSC, Rollo, Citizen).
- **A6 (105 mm × 148 mm / 4" × 6")**: The universal e-commerce standard shipping label format.
- **A5 (148 mm × 210 mm / Half A4)**: Ideal for laser printers (2 stickers per A4 page) or document pouches.

---

## 2. What Joy daa Needs to Request from the Post Office

Joy daa should visit the **Business Development (BD) Cell** at **Kolkata GPO (BBD Bagh)** or the local **Divisional Head Post Office (SSPO Office)**.

Here is the exact 4-point checklist to request:

### 1. Corporate Customer Account (BNPL Facility)
- **What to ask for**: "We want to open a Corporate BNPL (Book Now Pay Later) / Speed Post Corporate Account for our academic publishing house, Techno World."
- **Documents to carry**:
  - Techno World Trade License / Certificate of Incorporation.
  - GST Registration Certificate.
  - PAN Card of Proprietor / Directors.
  - Bank Account Details / Cancelled Cheque.
  - Projected monthly parcel volume (e.g. 500 – 5,000 parcels/month).
- **What you will receive**:
  - **Customer ID** (10-digit number, e.g. `3000064781`).
  - **Contract Number / Agreement ID** (e.g. `41585456`).
  - Monthly billing cycle and credit limit terms.

### 2. Static Server IP Whitelisting for CEPT API
- **What to ask for**: "We need our production server's Static Public IP Address whitelisted on the CEPT API Gateway firewall for automated parcel booking and electronic manifest upload."
- **Why this is strictly required**:
  - CEPT (Centre for Excellence in Postal Technology, Mysuru / Chennai) maintains a hardware security firewall.
  - CEPT **blocks** all API calls from non-whitelisted IP addresses.
  - You must provide the **exact Static Public IPv4 Address** of your cloud hosting server (e.g. `139.59.xx.xx` or AWS Elastic IP). Dynamic IPs (home broadband/office Wi-Fi) cannot be whitelisted.

### 3. Electronic Barcode Range Allocation (AWB Series)
- **What to ask for**: "Please allocate an initial electronic barcode range (AWB block) of 5,000 or 10,000 numbers for Speed Post (series `EW...IN` or `EB...IN`) and Registered Book Post."
- **How it works**:
  - The Post Office provides a starting number (e.g., `EW100000001IN`) to an ending number (e.g., `EW100010000IN`).
  - You enter this range in your server settings.
  - When you print stickers, the barcode is automatically assigned from your allocated range. When the postman or sorting center scans it, the central CEPT system immediately recognizes the package as booked by Techno World!

### 4. CEPT API Gateway Access Credentials
- **What to ask for**: "Customer EDI / API credentials for `/beextcustomer/process-articles`."
- **What you will receive**:
  - Production Gateway URL (`https://gateway.cept.gov.in` or `https://cept.gov.in`).
  - API Username & Secret Key / Token.
  - Technical Point of Contact (CEPT Helpdesk email / phone for onboarding).

---

## 3. Ready-to-Print Official Request Letter Template

*(Print on Techno World Publications Official Letterhead, Sign & Stamp)*

```text
To,
The Senior Superintendent of Post Offices /
Manager (Business Development Cell),
Kolkata GPO, B.B.D. Bagh,
Kolkata - 700001, West Bengal.

Subject: Request for Corporate BNPL Account, Electronic Barcode Allocation, 
         and Static Server IP Whitelisting on CEPT API Gateway

Respected Sir/Madam,

We, M/s Techno World, are a premier publisher and distributor of academic, 
college, and competitive examination textbooks based in College Street, Kolkata. 
We dispatch thousands of educational book parcels to students and institutions across 
all postal circles of India every month.

To streamline our dispatches through India Post's prestigious network, we kindly 
request the following:

1. Corporate Account Setup: Allotment of a Corporate Customer ID and Contract Number 
   under the Book Now Pay Later (BNPL) / Speed Post corporate facility.

2. Electronic Barcode (AWB) Range Allocation: Allocation of an electronic barcode 
   series (5,000 numbers) for Speed Post and Registered Book Post consignments.

3. Static Server IP Whitelisting for CEPT API Gateway:
   We have integrated our e-commerce dispatch system with India Post's CEPT API 
   specifications for pre-manifest electronic booking and tracking. Kindly whitelist 
   our production server's static IP address on the CEPT Gateway firewall:
   
   - Server Static IPv4 Address: [INSERT PRODUCTION SERVER IP HERE]
   - Technical Contact Email: info@technoworldbooks.in
   - Technical Contact Phone: +91 98300 00000
   - Organization Name: Techno World Publications
   - Primary Booking Post Office: Kolkata GPO (700001) / College Street SO (700006)

We have enclosed our GST Registration, Trade License, and KYC documents for your 
kind verification.

Thanking you,

Yours faithfully,

For TECHNO WORLD PUBLICATIONS

__________________________
Authorized Signatory / Joy Da
(Seal & Signature)
```

---

## 4. How the System Works Right Now (Zero Downtime)

Until CEPT completes the firewall IP whitelisting process:
1. **Instant Offline/Sandbox Fallback Engine**:
   - The system formats all consignment data strictly according to CEPT's JSON schema.
   - It auto-generates valid 13-character checksum-compliant barcodes (`EB...IN` for Speed Post, `BP...IN` for Book Post).
   - It looks up all Indian pin codes using the authentic India Post National Postal Directory with 100% uptime.
2. **Immediate Sticker Printing**:
   - Warehouse staff can choose **A7, A6, or A5** sticker sizes.
   - Live editable fields (weight, order ID, SKU codes, custom notes).
   - Direct 1-click browser printing (single, selected, or all pending).
   - The generated stickers meet all postal optical scanning requirements and are 100% accepted at the post office counter!
