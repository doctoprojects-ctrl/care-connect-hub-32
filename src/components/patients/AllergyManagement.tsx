import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  notes?: string;
  dateIdentified?: string;
  verifiedBy?: string;
}

interface AllergyManagementProps {
  patientId: string;
  allergies?: Allergy[];
  onUpdate?: (allergies: Allergy[]) => void;
}

export function AllergyManagement({ patientId, allergies = [], onUpdate }: AllergyManagementProps) {
  const [allergyList, setAllergyList] = useState<Allergy[]>(allergies);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<Allergy | null>(null);
  const [formData, setFormData] = useState({
    allergen: '',
    reaction: '',
    severity: 'mild' as 'mild' | 'moderate' | 'severe' | 'life-threatening',
    notes: '',
    dateIdentified: '',
    verifiedBy: ''
  });

  const resetForm = () => {
    setFormData({
      allergen: '',
      reaction: '',
      severity: 'mild' as 'mild' | 'moderate' | 'severe' | 'life-threatening',
      notes: '',
      dateIdentified: '',
      verifiedBy: ''
    });
  };

  const handleAddAllergy = () => {
    const newAllergy: Allergy = {
      id: Date.now().toString(),
      ...formData
    };
    const updatedAllergies = [...allergyList, newAllergy];
    setAllergyList(updatedAllergies);
    onUpdate?.(updatedAllergies);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditAllergy = (allergy: Allergy) => {
    setEditingAllergy(allergy);
    setFormData({
      ...allergy,
      notes: allergy.notes || '',
      dateIdentified: allergy.dateIdentified || '',
      verifiedBy: allergy.verifiedBy || ''
    });
  };

  const handleUpdateAllergy = () => {
    if (!editingAllergy) return;
    
    const updatedAllergies = allergyList.map(allergy =>
      allergy.id === editingAllergy.id ? { ...editingAllergy, ...formData } : allergy
    );
    setAllergyList(updatedAllergies);
    onUpdate?.(updatedAllergies);
    setEditingAllergy(null);
    resetForm();
  };

  const handleDeleteAllergy = (id: string) => {
    const updatedAllergies = allergyList.filter(allergy => allergy.id !== id);
    setAllergyList(updatedAllergies);
    onUpdate?.(updatedAllergies);
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'mild': return 'secondary';
      case 'moderate': return 'default';
      case 'severe': return 'destructive';
      case 'life-threatening': return 'destructive';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'severe' || severity === 'life-threatening') {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  const commonAllergens = [
    'Penicillin', 'Aspirin', 'Ibuprofen', 'Codeine', 'Morphine',
    'Peanuts', 'Tree nuts', 'Shellfish', 'Fish', 'Eggs', 'Milk', 'Soy', 'Wheat',
    'Latex', 'Bee stings', 'Wasp stings', 'Dust mites', 'Pet dander',
    'Pollen', 'Mold', 'Contrast dye', 'Adhesive tape'
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Allergies & Adverse Reactions
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Allergy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Allergy</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="allergen">Allergen</Label>
                  <div className="flex gap-2">
                    <Input
                      id="allergen"
                      value={formData.allergen}
                      onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                      placeholder="e.g., Penicillin, Peanuts, Latex"
                      className="flex-1"
                    />
                    <Select
                      value={formData.allergen}
                      onValueChange={(value) => setFormData({ ...formData, allergen: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Common" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonAllergens.map((allergen) => (
                          <SelectItem key={allergen} value={allergen}>
                            {allergen}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reaction">Reaction</Label>
                  <Input
                    id="reaction"
                    value={formData.reaction}
                    onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
                    placeholder="e.g., Rash, Hives, Anaphylaxis, Nausea"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(value: 'mild' | 'moderate' | 'severe' | 'life-threatening') => 
                      setFormData({ ...formData, severity: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                      <SelectItem value="life-threatening">Life-threatening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateIdentified">Date Identified (Optional)</Label>
                    <Input
                      id="dateIdentified"
                      type="date"
                      value={formData.dateIdentified}
                      onChange={(e) => setFormData({ ...formData, dateIdentified: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="verifiedBy">Verified By (Optional)</Label>
                    <Input
                      id="verifiedBy"
                      value={formData.verifiedBy}
                      onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                      placeholder="e.g., Dr. Sarah Johnson"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional details about the allergy or reaction..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAllergy}>Add Allergy</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {allergyList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No allergies recorded. This is good news! Add any known allergies to keep medical records complete.
          </div>
        ) : (
          <>
            {/* Critical Allergies Alert */}
            {allergyList.some(a => a.severity === 'severe' || a.severity === 'life-threatening') && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  Critical Allergies Alert
                </div>
                <div className="text-red-700 text-sm">
                  This patient has severe or life-threatening allergies. Please review carefully before prescribing medications or treatments.
                </div>
              </div>
            )}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Allergen</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date Identified</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergyList.map((allergy) => (
                  <TableRow key={allergy.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {getSeverityIcon(allergy.severity)}
                      {allergy.allergen}
                    </TableCell>
                    <TableCell>{allergy.reaction}</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadgeVariant(allergy.severity)} className="capitalize">
                        {allergy.severity.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {allergy.dateIdentified ? new Date(allergy.dateIdentified).toLocaleDateString() : 'Not specified'}
                    </TableCell>
                    <TableCell>{allergy.verifiedBy || 'Not specified'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditAllergy(allergy)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAllergy(allergy.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingAllergy} onOpenChange={() => setEditingAllergy(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Allergy</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-allergen">Allergen</Label>
              <Input
                id="edit-allergen"
                value={formData.allergen}
                onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-reaction">Reaction</Label>
              <Input
                id="edit-reaction"
                value={formData.reaction}
                onChange={(e) => setFormData({ ...formData, reaction: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-severity">Severity</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: 'mild' | 'moderate' | 'severe' | 'life-threatening') => 
                  setFormData({ ...formData, severity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                  <SelectItem value="life-threatening">Life-threatening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dateIdentified">Date Identified</Label>
                <Input
                  id="edit-dateIdentified"
                  type="date"
                  value={formData.dateIdentified}
                  onChange={(e) => setFormData({ ...formData, dateIdentified: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-verifiedBy">Verified By</Label>
                <Input
                  id="edit-verifiedBy"
                  value={formData.verifiedBy}
                  onChange={(e) => setFormData({ ...formData, verifiedBy: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Additional Notes</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingAllergy(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAllergy}>Update Allergy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}