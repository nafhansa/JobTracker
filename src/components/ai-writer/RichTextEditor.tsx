"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, forwardRef, useImperativeHandle } from "react";
import EditorToolbar from "./EditorToolbar";

interface RichTextEditorProps {
  initialContent: string;
  editable: boolean;
  onContentChange?: (html: string) => void;
}

const RichTextEditor = forwardRef<{ getHTML: () => string }, RichTextEditorProps>(
  ({ initialContent, editable, onContentChange }, ref) => {
    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Underline,
        Placeholder.configure({
          placeholder: "Start writing...",
        }),
      ],
      content: initialContent,
      editable,
      onUpdate: ({ editor }) => {
        onContentChange?.(editor.getHTML());
      },
    });

    useEffect(() => {
      if (editor && !editor.isDestroyed) {
        editor.setEditable(editable);
      }
    }, [editor, editable]);

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
    }));

    return (
      <div className="border border-border rounded-lg overflow-hidden">
        {editable && <EditorToolbar editor={editor} />}
        <EditorContent
          editor={editor}
          className={`rich-editor max-w-none bg-white dark:bg-background ${
            editable
              ? "min-h-[200px] p-4 focus:outline-none"
              : "p-4"
          }`}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;