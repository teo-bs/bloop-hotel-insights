import { useState } from "react";
import { Users, Plus, Edit2, Trash2, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Group {
  id: string;
  name: string;
  description: string;
  propertyCount: number;
  createdAt: string;
}

const initialGroups: Group[] = [
  {
    id: "1",
    name: "Downtown Properties",
    description: "Hotels located in downtown areas",
    propertyCount: 3,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Luxury Collection",
    description: "Premium properties with 4+ star ratings",
    propertyCount: 2,
    createdAt: "2024-01-10",
  },
];

export default function OrganizationGroups() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGroup: Group = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        propertyCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setGroups(prev => [...prev, newGroup]);
      setFormData({ name: "", description: "" });
      setIsCreateModalOpen(false);
      
      toast({
        title: "Group created",
        description: "Your new property group has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error creating group",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroup || !formData.name.trim()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGroups(prev => prev.map(group => 
        group.id === editingGroup.id 
          ? { ...group, name: formData.name, description: formData.description }
          : group
      ));
      
      setEditingGroup(null);
      setFormData({ name: "", description: "" });
      
      toast({
        title: "Group updated",
        description: "The property group has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating group",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setGroups(prev => prev.filter(group => group.id !== groupId));
      
      toast({
        title: "Group deleted",
        description: "The property group has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting group",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description,
    });
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setEditingGroup(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Groups</h1>
        </div>
        <p className="text-slate-600">
          Organize properties into groups for easier management.
        </p>
      </div>

      {/* Groups List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Property Groups</CardTitle>
              <CardDescription>
                Organize your properties into logical groups for better management.
              </CardDescription>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                  <DialogDescription>
                    Create a new property group to organize your hotels.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Downtown Properties"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description for this group"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={closeModals}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup} disabled={isLoading || !formData.name.trim()}>
                    {isLoading ? "Creating..." : "Create Group"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No groups yet</h3>
              <p className="text-slate-600 mb-4">
                Create your first group to organize properties.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Group
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{group.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {group.propertyCount} {group.propertyCount === 1 ? 'property' : 'properties'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{group.description}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(group)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingGroup} onOpenChange={() => setEditingGroup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update the group name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Group Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeModals}>
              Cancel
            </Button>
            <Button onClick={handleEditGroup} disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}