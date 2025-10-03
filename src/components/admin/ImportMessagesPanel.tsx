import React, { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ImportMessagesPanel() {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onImport() {
    const file = ref.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    // Validate file type
    if (file.type !== "application/json") {
      toast.error("Only JSON files are allowed");
      return;
    }

    setBusy(true);
    try {
      const text = await file.text();
      
      // Validate JSON structure
      let payload;
      try {
        payload = JSON.parse(text);
      } catch {
        toast.error("Invalid JSON format");
        setBusy(false);
        return;
      }

      if (!Array.isArray(payload)) {
        toast.error("JSON must be an array of messages");
        setBusy(false);
        return;
      }

      // Validate array size (max 1000 messages per import)
      if (payload.length > 1000) {
        toast.error("Maximum 1000 messages per import");
        setBusy(false);
        return;
      }

      const { data, error } = await supabase.rpc("import_messages", { p_payload: payload });
      
      if (error) {
        throw error;
      }

      toast.success(`Successfully imported ${data ?? 0} messages`);
      if (ref.current) ref.current.value = "";
    } catch (error: any) {
      toast.error(error?.message || "Import failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Messages (JSON)</CardTitle>
        <CardDescription>Import messages from JSON file (max 10MB, 1000 messages)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input 
          type="file" 
          accept="application/json" 
          ref={ref} 
          disabled={busy}
          className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
        <Button onClick={onImport} disabled={busy}>
          {busy ? "Importing..." : "Import"}
        </Button>
      </CardContent>
    </Card>
  );
}
