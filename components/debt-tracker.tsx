"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CURRENCY_SYMBOL } from "@/lib/types";
import type { PersonDebt, Debt } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DebtTrackerProps {
  personDebts: PersonDebt[];
  debts: Debt[];
  onAddPerson: (personName: string) => Promise<void>;
  onRemovePerson: (personDebtId: string) => Promise<void>;
  onAddDebt: (
    personDebtId: string,
    type: "lent" | "borrowed",
    amount: number,
    description: string,
  ) => Promise<void>;
  onRemoveDebt: (debtId: string) => Promise<void>;
  onMarkAsPaid: (debtId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function DebtTracker({
  personDebts,
  debts,
  onAddPerson,
  onRemovePerson,
  onAddDebt,
  onRemoveDebt,
  onMarkAsPaid,
  isLoading = false,
}: DebtTrackerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [isAddingDebt, setIsAddingDebt] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [debtType, setDebtType] = useState<"lent" | "borrowed">("lent");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtDescription, setDebtDescription] = useState("");
  const [error, setError] = useState("");

  const filteredPeople = personDebts.filter((pd) =>
    pd.personName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedPerson = personDebts.find((p) => p.id === selectedPersonId);
  const personDebtList = selectedPerson
    ? debts.filter((d) => d.personDebtId === selectedPersonId)
    : [];

  const getPersonStats = (personDebtId: string) => {
    const personDebts = debts.filter((d) => d.personDebtId === personDebtId);
    const lent = personDebts
      .filter((d) => d.type === "lent" && d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0);
    const borrowed = personDebts
      .filter((d) => d.type === "borrowed" && d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0);
    const pendingCount = personDebts.filter(
      (d) => d.status === "pending",
    ).length;
    const paidCount = personDebts.filter((d) => d.status === "paid").length;
    return { lent, borrowed, pendingCount, paidCount };
  };

  const handleAddPerson = async () => {
    setError("");
    if (!newPersonName.trim()) {
      setError("Please enter a person name.");
      return;
    }

    try {
      await onAddPerson(newPersonName);
      setNewPersonName("");
      setIsAddingPerson(false);
    } catch (err) {
      setError("Failed to add person.");
      console.error("Add person error:", err);
    }
  };

  const handleAddDebt = async () => {
    setError("");
    if (!selectedPersonId) {
      setError("Please select a person.");
      return;
    }

    if (!debtAmount || !debtDescription.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const amount = parseFloat(debtAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      await onAddDebt(selectedPersonId, debtType, amount, debtDescription);
      setDebtAmount("");
      setDebtDescription("");
      setDebtType("lent");
      setIsAddingDebt(false);
    } catch (err) {
      setError("Failed to add debt.");
      console.error("Add debt error:", err);
    }
  };

  const handleRemovePerson = async (personDebtId: string) => {
    if (
      window.confirm(
        "Are you sure? This will delete all debts for this person.",
      )
    ) {
      try {
        await onRemovePerson(personDebtId);
        setSelectedPersonId(null);
      } catch (err) {
        setError("Failed to remove person.");
        console.error("Remove person error:", err);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <Card className="p-3 bg-destructive/10 border-destructive text-destructive text-sm">
          {error}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* People List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">People</h3>
              <Dialog open={isAddingPerson} onOpenChange={setIsAddingPerson}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    + Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Person</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Person name"
                      value={newPersonName}
                      onChange={(e) => setNewPersonName(e.target.value)}
                    />
                    <Button
                      onClick={handleAddPerson}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Add Person
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-3"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPeople.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No people found. Add one to get started.
                </p>
              ) : (
                filteredPeople.map((person) => {
                  const stats = getPersonStats(person.id);
                  const isSelected = selectedPersonId === person.id;
                  return (
                    <div
                      key={person.id}
                      onClick={() => setSelectedPersonId(person.id)}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {person.personName}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePerson(person.id);
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap text-xs">
                        {stats.lent > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-green/10 text-green-700"
                          >
                            You lent: {CURRENCY_SYMBOL}
                            {stats.lent.toFixed(0)}
                          </Badge>
                        )}
                        {stats.borrowed > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-orange/10 text-orange-700"
                          >
                            You owe: {CURRENCY_SYMBOL}
                            {stats.borrowed.toFixed(0)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Debts Details */}
        <div className="lg:col-span-2">
          {selectedPerson ? (
            <Card className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedPerson.personName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {personDebtList.length} total debts
                  </p>
                </div>
                <Dialog open={isAddingDebt} onOpenChange={setIsAddingDebt}>
                  <DialogTrigger asChild>
                    <Button variant="outline">+ Add Debt</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Add Debt for {selectedPerson.personName}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button
                          variant={debtType === "lent" ? "default" : "outline"}
                          onClick={() => setDebtType("lent")}
                          size="sm"
                          className="flex-1"
                        >
                          You Lent
                        </Button>
                        <Button
                          variant={
                            debtType === "borrowed" ? "default" : "outline"
                          }
                          onClick={() => setDebtType("borrowed")}
                          size="sm"
                          className="flex-1"
                        >
                          You Borrowed
                        </Button>
                      </div>
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={debtAmount}
                        onChange={(e) => setDebtAmount(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                      <Input
                        placeholder="Description (e.g., 'Movie tickets', 'Lunch')"
                        value={debtDescription}
                        onChange={(e) => setDebtDescription(e.target.value)}
                      />
                      <Button
                        onClick={handleAddDebt}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Add Debt
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending">
                    Pending (
                    {
                      personDebtList.filter((d) => d.status === "pending")
                        .length
                    }
                    )
                  </TabsTrigger>
                  <TabsTrigger value="paid">
                    Paid (
                    {personDebtList.filter((d) => d.status === "paid").length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-2">
                  {personDebtList.filter((d) => d.status === "pending")
                    .length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No pending debts
                    </p>
                  ) : (
                    personDebtList
                      .filter((d) => d.status === "pending")
                      .map((debt) => (
                        <Card
                          key={debt.id}
                          className="p-3 flex justify-between items-start"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className={
                                  debt.type === "lent"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                                }
                              >
                                {debt.type === "lent" ? "You Lent" : "You Owe"}
                              </Badge>
                              <span className="font-semibold text-sm">
                                {CURRENCY_SYMBOL}
                                {debt.amount.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {debt.description}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onMarkAsPaid(debt.id)}
                              disabled={isLoading}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onRemoveDebt(debt.id)}
                              disabled={isLoading}
                            >
                              ×
                            </Button>
                          </div>
                        </Card>
                      ))
                  )}
                </TabsContent>

                <TabsContent value="paid" className="space-y-2">
                  {personDebtList.filter((d) => d.status === "paid").length ===
                  0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No paid debts
                    </p>
                  ) : (
                    personDebtList
                      .filter((d) => d.status === "paid")
                      .map((debt) => (
                        <Card
                          key={debt.id}
                          className="p-3 flex justify-between items-start opacity-60"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className={
                                  debt.type === "lent"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                                }
                              >
                                {debt.type === "lent" ? "You Lent" : "You Owe"}
                              </Badge>
                              <span className="font-semibold text-sm line-through">
                                {CURRENCY_SYMBOL}
                                {debt.amount.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {debt.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => onRemoveDebt(debt.id)}
                            disabled={isLoading}
                          >
                            ×
                          </Button>
                        </Card>
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Select a person to view or add debts
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
