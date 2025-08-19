import { useState } from "react";
import { CreditCard, Download, Plus, Trash2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const paymentMethods = [
  {
    id: "1",
    type: "Visa",
    last4: "4242",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: "2",
    type: "Mastercard",
    last4: "8888",
    expiry: "09/25",
    isDefault: false,
  },
];

const invoices = [
  {
    id: "INV-2024-001",
    date: "2024-01-15",
    amount: "$299.00",
    status: "paid",
    period: "Jan 2024",
  },
  {
    id: "INV-2023-012",
    date: "2023-12-15",
    amount: "$299.00",
    status: "paid",
    period: "Dec 2023",
  },
  {
    id: "INV-2023-011",
    date: "2023-11-15",
    amount: "$299.00",
    status: "paid",
    period: "Nov 2023",
  },
];

export default function OrganizationBilling() {
  const [loadingActions, setLoadingActions] = useState<string>("");

  const handleAction = async (action: string, id?: string) => {
    setLoadingActions(id ? `${action}-${id}` : action);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoadingActions("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Billing & Payments</h1>
        </div>
        <p className="text-slate-600">
          Payment methods, invoices, subscriptions.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Your subscription plan and usage details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-lg">Professional Plan</h3>
              <p className="text-slate-600">$299/month • Unlimited reviews & insights</p>
              <p className="text-sm text-slate-500 mt-1">Next billing: February 15, 2024</p>
            </div>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Manage Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods and billing preferences.
              </CardDescription>
            </div>
            <Button 
              onClick={() => handleAction("add-payment")}
              disabled={loadingActions === "add-payment"}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.type} •••• {method.last4}</span>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">Expires {method.expiry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button variant="ghost" size="sm">
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAction("delete-payment", method.id)}
                    disabled={loadingActions === `delete-payment-${method.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            Download your billing history and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No invoices found for this period.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-slate-500">{invoice.period}</div>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className="font-medium">{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAction("download", invoice.id)}
                        disabled={loadingActions === `download-${invoice.id}`}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}