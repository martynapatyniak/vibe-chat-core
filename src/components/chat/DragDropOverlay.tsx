import { Upload, Image, FileText, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface DragDropOverlayProps {
  isDragging: boolean;
  isValidDrop: boolean;
}

export const DragDropOverlay = ({ isDragging, isValidDrop }: DragDropOverlayProps) => {
  if (!isDragging) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-300",
      "flex items-center justify-center",
      isDragging ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className={cn(
        "bg-card border-2 border-dashed rounded-2xl p-12 transition-all duration-300 transform",
        isValidDrop 
          ? "border-primary bg-primary/5 scale-105" 
          : "border-destructive bg-destructive/5 scale-95"
      )}>
        <div className="text-center space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-colors",
            isValidDrop 
              ? "bg-primary text-primary-foreground" 
              : "bg-destructive text-destructive-foreground"
          )}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className={cn(
              "text-xl font-semibold mb-2",
              isValidDrop ? "text-primary" : "text-destructive"
            )}>
              {isValidDrop ? "Drop files to upload" : "Invalid file type"}
            </h3>
            <p className="text-muted-foreground">
              {isValidDrop 
                ? "Release to upload your files to the chat"
                : "Only images, videos, audio, and documents are allowed"
              }
            </p>
          </div>

          {isValidDrop && (
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                <span className="text-sm">Images</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Documents</span>
              </div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="text-sm">Media</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};