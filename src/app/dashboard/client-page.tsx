'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ArrowLeft, FileUp, Loader2, Sparkles, Download, RefreshCw, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import mammoth from "mammoth";
import { reformatCitations } from '@/ai/flows/reformat-citations'

const citationStyles = [
  'APA 7th Edition',
  'MLA 9th Edition',
  'Chicago 17th Edition',
  'Harvard',
  'Vancouver',
  'IEEE',
]

type Step = 'upload' | 'references' | 'style' | 'result'

export function DashboardClientPage() {
  const [step, setStep] = useState<Step>('upload')
  const [isLoading, setIsLoading] = useState(false)
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [documentText, setDocumentText] = useState('')
  const [referencesText, setReferencesText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [reformattedText, setReformattedText] = useState('')
  const [apiError, setApiError] = useState<string | null>(null);
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          if (arrayBuffer) {
            try {
              const result = await mammoth.extractRawText({ arrayBuffer });
              setDocumentText(result.value);
              setDocumentFile(file);
            } catch (error) {
              console.error('Error reading docx file:', error);
              toast({
                variant: 'destructive',
                title: 'Error Reading File',
                description: 'Could not read the content of the .docx file.',
              });
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (file.type === 'application/pdf') {
         toast({
          variant: 'destructive',
          title: 'PDFs Not Supported Yet',
          description: 'Sorry, we are still working on PDF support. Please upload a .docx file.',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a .docx file.',
        });
      }
    }
  };

  const handleReformat = async () => {
    if (!selectedStyle) {
      toast({
        variant: 'destructive',
        title: 'No Style Selected',
        description: 'Please select a citation style.',
      })
      return
    }
    setIsLoading(true)
    setApiError(null);
    try {
      const result = await reformatCitations({
        documentText: documentText,
        detectedReferences: referencesText,
        selectedCitationStyle: selectedStyle,
      })
      setReformattedText(result.reformattedDocument)
      setStep('result')
    } catch (error: any) {
      console.error(error);
      // Check if MOCK_AI is not 'true' and the error is an API key error
      if (process.env.NEXT_PUBLIC_MOCK_AI !== 'true' && error.message.includes('API key not valid')) {
        setApiError('Your Google AI API key is not valid. Please check your .env file.');
      } else {
         toast({
            variant: 'destructive',
            title: 'An Error Occurred',
            description: error.message || 'Failed to reformat the document. Please try again.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const startOver = () => {
    setStep('upload')
    setDocumentFile(null)
    setDocumentText('')
    setReferencesText('')
    setSelectedStyle('')
    setReformattedText('')
    setApiError(null)
  }
  
  const handleDownload = () => {
    const paragraphs = reformattedText.split('\n\n').map(text => new Paragraph({ 
        children: text.split('\n').map(line => new TextRun(line))
    }));
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "reformatted-document.docx");
    });
  }

  const renderStep = () => {
    switch (step) {
      case 'upload':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Upload Your Document</CardTitle>
              <CardDescription>
                Upload your document in .docx format to begin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">DOCX only</p>
                    {documentFile && <p className="mt-4 text-sm font-medium text-primary">{documentFile.name}</p>}
                  </div>
                  <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".docx" />
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setStep('references')} disabled={!documentFile}>
                Next Step
              </Button>
            </CardFooter>
          </Card>
        )
      case 'references':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Add References</CardTitle>
              <CardDescription>
                Paste your references from Zotero, Mendeley, or another manager below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your references here..."
                className="min-h-[200px]"
                value={referencesText}
                onChange={(e) => setReferencesText(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep('style')} disabled={!referencesText}>
                Next Step
              </Button>
            </CardFooter>
          </Card>
        )
      case 'style':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Select Citation Style</CardTitle>
              <CardDescription>
                Choose the citation style you want to apply to your document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {apiError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>API Key Error</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              <Select onValueChange={setSelectedStyle} value={selectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a style" />
                </SelectTrigger>
                <SelectContent>
                  {citationStyles.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('references')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleReformat} disabled={!selectedStyle || isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Reformat Document
              </Button>
            </CardFooter>
          </Card>
        )
      case 'result':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Review and Export</CardTitle>
              <CardDescription>
                Review the formatted text. You can make manual corrections before exporting.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="original-text" className="mb-2 block">Original Text</Label>
                    <Textarea id="original-text" value={documentText} readOnly className="min-h-[300px] bg-muted" />
                </div>
                <div>
                    <Label htmlFor="reformatted-text" className="mb-2 block">Reformatted Text</Label>
                    <Textarea
                        id="reformatted-text"
                        value={reformattedText}
                        onChange={(e) => setReformattedText(e.target.value)}
                        className="min-h-[300px] focus:border-accent"
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={startOver}>
                <RefreshCw className="mr-2 h-4 w-4" /> Start Over
              </Button>
              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" /> Download .docx
              </Button>
            </CardFooter>
          </Card>
        )
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {renderStep()}
    </div>
  )
}
