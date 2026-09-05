from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

router = APIRouter(prefix="/billing", tags=["billing"])

class SendInvoiceRequest(BaseModel):
    email: Optional[str] = None

# In-memory realistic dataset for billing accounts
BILLING_DATA = {
    "BIL-2045": {
        "id": "BIL-2045",
        "quotationId": "QT-2026-0184",
        "customerName": "ABC Industries Ltd.",
        "status": "PARTIALLY_PAID",
        "createdAt": "2026-09-04T11:00:00Z",
        "currency": "USD",
        "totalAmount": 142500.0,
        "oneTimeCharges": 120000.0,
        "recurringCharges": 22500.0,
        "amountPaid": 60000.0,
        "outstandingAmount": 82500.0,
        "customer": {
            "name": "ABC Industries Ltd.",
            "customerId": "CUST-0012",
            "address": "Tower 4, Prime Tech Park, Industrial Corridor, San Jose, CA 95134",
            "email": "accounts.payable@abcindustries.com",
            "phone": "+1 (408) 555-0192",
            "taxId": "US-EIN-94829104"
        },
        "oneTimeItems": [
            {
                "id": "OT-01",
                "productName": "Enterprise Core Router XG-900",
                "sku": "HW-RTR-900",
                "quantity": 10,
                "unitPrice": 9500.0,
                "discountPercent": 12.0,
                "discountAmount": 11400.0,
                "taxPercent": 8.0,
                "taxAmount": 6688.0,
                "total": 90288.0
            },
            {
                "id": "OT-02",
                "productName": "Rack Mounting Hardware & Fiber Kit",
                "sku": "ACC-RK-04",
                "quantity": 10,
                "unitPrice": 320.0,
                "discountPercent": 5.0,
                "discountAmount": 160.0,
                "taxPercent": 8.0,
                "taxAmount": 243.2,
                "total": 3283.2
            },
            {
                "id": "OT-03",
                "productName": "On-Site Deployment & Gateway Integration",
                "sku": "SRV-DEP-01",
                "quantity": 1,
                "unitPrice": 28000.0,
                "discountPercent": 10.0,
                "discountAmount": 2800.0,
                "taxPercent": 5.0,
                "taxAmount": 1260.0,
                "total": 26460.0
            }
        ],
        "recurringItems": [
            {
                "id": "REC-01",
                "planName": "DealFlow Enterprise Cloud Management Suite",
                "sku": "SaaS-ENT-YR",
                "quantity": 50,
                "billingCycle": "MONTHLY",
                "recurringAmount": 1250.0,
                "nextBillingDate": "2026-10-05T00:00:00Z",
                "status": "ACTIVE",
                "prorationNotice": "Includes 14 days onboarding grace period"
            },
            {
                "id": "REC-02",
                "planName": "24/7 Mission-Critical SLA & Security Sentinel",
                "sku": "SLA-PLAT-YR",
                "quantity": 1,
                "billingCycle": "YEARLY",
                "recurringAmount": 7500.0,
                "nextBillingDate": "2027-09-05T00:00:00Z",
                "status": "ACTIVE"
            }
        ],
        "payment": {
            "status": "PARTIALLY_PAID",
            "method": "Corporate Net 30 / ACH",
            "transactionId": "TXN-8849204-ACH",
            "paidAmount": 60000.0,
            "paymentDate": "2026-09-04T15:45:00Z",
            "outstandingAmount": 82500.0,
            "currency": "USD"
        },
        "invoice": {
            "invoiceNumber": "INV-2045",
            "invoiceDate": "2026-09-04T11:30:00Z",
            "dueDate": "2026-10-04T23:59:59Z",
            "invoiceAmount": 142500.0,
            "status": "PARTIALLY_PAID",
            "downloadUrl": "/api/billing/BIL-2045/invoice.pdf"
        },
        "timeline": [
            {
                "id": 1,
                "title": "Billing Created",
                "status": "CREATED",
                "date": "2026-09-04T11:00:00Z",
                "description": "Billing order generated following sales manager quotation sign-off",
                "actor": "System Engine"
            },
            {
                "id": 2,
                "title": "Invoice Generated",
                "status": "GENERATED",
                "date": "2026-09-04T11:30:00Z",
                "description": "Consolidated tax invoice #INV-2045 issued for $142,500",
                "actor": "Finance/Ops (Felix)"
            },
            {
                "id": 3,
                "title": "Invoice Sent",
                "status": "SENT",
                "date": "2026-09-04T11:45:00Z",
                "description": "Dispatched electronically to accounts.payable@abcindustries.com",
                "actor": "Notification Service"
            },
            {
                "id": 4,
                "title": "Payment Initiated",
                "status": "PROCESSING",
                "date": "2026-09-04T15:10:00Z",
                "description": "Customer initiated ACH advance payment wire",
                "actor": "Customer (Buyer)"
            },
            {
                "id": 5,
                "title": "Partial Payment Completed",
                "status": "COMPLETED",
                "date": "2026-09-04T15:45:00Z",
                "description": "Received $60,000.00 via ACH. Balance $82,500.00 due on Net 30",
                "actor": "Treasury Automated Clearing"
            }
        ],
        "permissions": {
            "can_send_invoice": True,
            "can_download_invoice": True,
            "can_record_payment": True
        }
    }
}

@router.get("")
def list_billing_orders(status: Optional[str] = None, search: Optional[str] = None):
    results = list(BILLING_DATA.values())
    if status and status != "ALL":
        results = [b for b in results if b["status"].upper() == status.upper()]
    if search:
        q = search.lower()
        results = [
            b for b in results
            if q in b["id"].lower() or q in b["quotationId"].lower() or q in b["customerName"].lower()
        ]
    return results

@router.get("/summary")
def get_billing_summary():
    records = list(BILLING_DATA.values())
    return {
        "totalBillingOrders": len(records),
        "totalAmount": sum(r["totalAmount"] for r in records),
        "oneTimeCharges": sum(r["oneTimeCharges"] for r in records),
        "recurringCharges": sum(r["recurringCharges"] for r in records),
        "amountPaid": sum(r["amountPaid"] for r in records),
        "outstandingAmount": sum(r["outstandingAmount"] for r in records),
    }

@router.get("/{billing_id}")
def get_billing_detail(billing_id: str):
    record = BILLING_DATA.get(billing_id.upper())
    if not record:
        # Fallback to default
        if BILLING_DATA:
            return next(iter(BILLING_DATA.values()))
        raise HTTPException(status_code=404, detail=f"Billing record {billing_id} not found")
    return record

@router.get("/{billing_id}/items")
def get_billing_items(billing_id: str):
    record = get_billing_detail(billing_id)
    return {
        "oneTimeItems": record["oneTimeItems"],
        "recurringItems": record["recurringItems"],
    }

@router.get("/{billing_id}/payments")
def get_billing_payments(billing_id: str):
    record = get_billing_detail(billing_id)
    return record["payment"]

@router.get("/{billing_id}/timeline")
def get_billing_timeline(billing_id: str):
    record = get_billing_detail(billing_id)
    return record["timeline"]

@router.get("/{billing_id}/invoice")
def get_billing_invoice(billing_id: str):
    record = get_billing_detail(billing_id)
    return record["invoice"]

@router.post("/{billing_id}/send-invoice")
def send_billing_invoice(billing_id: str, payload: SendInvoiceRequest):
    record = get_billing_detail(billing_id)
    target_email = payload.email or record["customer"]["email"]
    return {
        "success": True,
        "message": f"Invoice {record['invoice']['invoiceNumber']} dispatched to {target_email}",
        "sentAt": datetime.utcnow().isoformat(),
    }
