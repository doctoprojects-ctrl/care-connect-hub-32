import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, FileText, Download, Eye, Trash2, File, Image, FileX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Document {
  id: string;
  name: string;
  type: 'medical-record' | 'lab-result' | 'insurance' | 'identification' | 'prescription' | 'image' | 'other';
  fileType: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  notes?: string;
  url?: string; // In real app, this would be the file URL
}

interface DocumentManagementProps {
  patientId: string;
  documents?: Document[];
  onUpdate?: (documents: Document[]) => void;
}

export function DocumentManagement({ patientId, documents = [], onUpdate }: DocumentManagementProps) {
  const [documentList, setDocumentList] = useState<Document[]>(documents);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    name: '',
    type: 'medical-record' as const,
    notes: '',
    file: null as File | null
  });
  const { toast } = useToast();

  const resetUploadForm = () => {
    setUploadData({
      name: '',
      type: 'medical-record',
      notes: '',
      file: null
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.includes('pdf')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getDocumentTypeBadge = (type: string): "secondary" | "default" | "destructive" | "outline" => {
    const colors: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
      'medical-record': 'default',
      'lab-result': 'secondary',
      'insurance': 'outline',
      'identification': 'destructive',
      'prescription': 'default',
      'image': 'secondary',
      'other': 'outline'
    };
    return colors[type] || 'outline';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }

      setUploadData({
        ...uploadData,
        file,
        name: uploadData.name || file.name.split('.')[0]
      });
    }
  };

  const handleUploadDocument = () => {
    if (!uploadData.file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    // Simulate file upload
    const newDocument: Document = {
      id: Date.now().toString(),
      name: uploadData.name,
      type: uploadData.type,
      fileType: uploadData.file.type,
      fileSize: uploadData.file.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: 'Current User', // In real app, get from auth context
      notes: uploadData.notes,
      url: URL.createObjectURL(uploadData.file) // In real app, this would be the uploaded file URL
    };

    const updatedDocuments = [...documentList, newDocument];
    setDocumentList(updatedDocuments);
    onUpdate?.(updatedDocuments);
    setIsUploadDialogOpen(false);
    resetUploadForm();

    toast({
      title: "Document uploaded",
      description: `${newDocument.name} has been uploaded successfully`
    });
  };

  const handleDeleteDocument = (id: string) => {
    const updatedDocuments = documentList.filter(doc => doc.id !== id);
    setDocumentList(updatedDocuments);
    onUpdate?.(updatedDocuments);
    
    toast({
      title: "Document deleted",
      description: "The document has been removed"
    });
  };

  const handleDownloadDocument = (document: Document) => {
    // Simulate download
    toast({
      title: "Download started",
      description: `Downloading ${document.name}`
    });
  };

  const handleViewDocument = (document: Document) => {
    // Simulate view
    if (document.url) {
      window.open(document.url, '_blank');
    } else {
      toast({
        title: "Document preview",
        description: `Opening ${document.name} in new window`
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Documents & Files</CardTitle>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Select File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.tiff"
                  />
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, TIFF (Max 10MB)
                  </p>
                </div>
                
                {uploadData.file && (
                  <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
                    {getFileIcon(uploadData.file.type)}
                    <div className="flex-1">
                      <p className="font-medium">{uploadData.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadData.file.size)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="doc-name">Document Name</Label>
                  <Input
                    id="doc-name"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                    placeholder="Enter document name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-type">Document Type</Label>
                  <Select
                    value={uploadData.type}
                    onValueChange={(value: any) => setUploadData({ ...uploadData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical-record">Medical Record</SelectItem>
                      <SelectItem value="lab-result">Lab Result</SelectItem>
                      <SelectItem value="insurance">Insurance Document</SelectItem>
                      <SelectItem value="identification">ID/Identification</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="image">Medical Image</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doc-notes">Notes (Optional)</Label>
                  <Input
                    id="doc-notes"
                    value={uploadData.notes}
                    onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                    placeholder="Additional notes about this document"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUploadDocument} disabled={!uploadData.file}>
                    Upload Document
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {documentList.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileX className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet.</p>
            <p className="text-sm">Upload medical records, lab results, and other important documents.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentList.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getFileIcon(document.fileType)}
                      <div>
                        <p className="font-medium">{document.name}</p>
                        {document.notes && (
                          <p className="text-sm text-muted-foreground">{document.notes}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getDocumentTypeBadge(document.type)} className="capitalize">
                      {document.type.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatFileSize(document.fileSize)}</TableCell>
                  <TableCell>{new Date(document.uploadDate).toLocaleDateString()}</TableCell>
                  <TableCell>{document.uploadedBy}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDocument(document)}
                        title="View document"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadDocument(document)}
                        title="Download document"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(document.id)}
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}