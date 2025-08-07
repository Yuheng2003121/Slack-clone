import React, {
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Quill, { Delta, Op, QuillOptions } from "quill";
import { PiTextAa } from "react-icons/pi";
import "quill/dist/quill.snow.css";
import { Button } from "./ui/button";
import { MdSend } from "react-icons/md";
import { ImageIcon, Keyboard, Smile, XIcon } from "lucide-react";
import Hint from "./Hint";
import { cn } from "@/lib/utils";
import EmojiPopover from "./EmojiPopover";
import Image from "next/image";

interface OnSubmit {
  image: File | null;
  body: string;
}
interface EditorProps {
  variant?: "create" | "update";
  onSubmit: ({ image, body }: OnSubmit) => void;
  onCancel?: () => void;
  placeHolder?: string;
  disabled?: boolean;
  defaultValue?: Delta | Op[];
  innerRef?: RefObject<Quill | null>;
}
export default function Editor({
  variant = "create",
  onCancel,
  onSubmit,
  placeHolder = "Write something...",
  disabled = false,
  defaultValue = [],
  innerRef,
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const submiteRef = useRef(onSubmit);
  const placeholderRef = useRef(placeHolder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const disabledRef = useRef(disabled);
  const imageElementRef = useRef<HTMLInputElement | null>(null);

  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
 
  useLayoutEffect(() => {
    submiteRef.current = onSubmit;
    placeholderRef.current = placeHolder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const editorContainer = container.appendChild(
      container.ownerDocument.createElement("div")
    );
    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeholderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [
            { list: "ordered" }, // 有序列表
            { list: "bullet" }, // 无序列表
          ],
        ],
        keyboard: {
          bindings: {
            enter: {
              key: "Enter",
              handler: () => {
                const text = quill.getText();
                const addImage = imageElementRef.current?.files?.[0] || null ;

                const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;
                if(isEmpty) return;

                const body = JSON.stringify(quill.getContents())
                submiteRef.current?.({ body:body, image: addImage });
                return;
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true,
              handler: () => {
                //在 Quill 编辑器的当前光标位置插入一个换行符 \n​​。如果当前没有选区（光标不在编辑器中），则默认在编辑器开头（索引 0）插入
                quill.insertText(quill.getSelection()?.index || 0, "\n");
                
              },
            },
          },
        },
      },
    };
    const quill = new Quill(editorContainer, options);
    quillRef.current = quill;
    quillRef.current.focus();
    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());
    quill.on("text-change", () => {
      setText(quill.getText());
    });

    return () => {
      quill.off("text-change");
      if (container) {
        container.innerHTML = "";
      }

      if (quillRef.current) {
        quillRef.current = null;
      }

      if (innerRef?.current) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  // const isEmpty = text.trim().length === 0;
  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

  const onEmojiSelect = (emoji: { native: string }) => {
    const quill = quillRef.current;
    quill?.insertText(quill.getSelection()?.index || 0, emoji.native);
  };
  const toggleToolbar = () => {
    setIsToolbarVisible(current => !current)
    const toolbarElement = containerRef.current?.querySelector('.ql-toolbar')
    if(toolbarElement) {
      toolbarElement.classList.toggle('hidden')
    }
  }

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageElementRef}
        onChange={(e) => setImage(e.target.files![0])}
        className="hidden"
      />
      <div
        className={`flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white ${disabled && 'opacity-50'} `}
      >
        <div ref={containerRef} className="h-full ql-custom" />
        {!!image && (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove image">
                <button
                  className="hidden group-hover/image:flex items-center justify-center rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white "
                  onClick={() => {
                    setImage(null);
                    imageElementRef.current!.value = "";
                  }}
                >
                  <XIcon className="size-4" />
                </button>
              </Hint>
              <Image
                src={URL.createObjectURL(image)}
                alt="uploaded"
                fill
                className="rounded-xl overflow-hidden object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5] items-center">
          <Hint label={isToolbarVisible ? "hide toolbar" : "show toolbar"}>
            <Button
              disabled={disabled}
              size="icon"
              variant={"ghost"}
              onClick={toggleToolbar}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>
          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size="icon" variant={"ghost"}>
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>
          {variant === "create" && (
            <Hint label="Image">
              <Button
                size="icon"
                variant={"ghost"}
                disabled={disabled}
                onClick={() => imageElementRef.current?.click()}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}
          {variant === "update" && (
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant={"outline"}
                size={"sm"}
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>

              <Button
                variant={"outline"}
                size={"sm"}
                disabled={disabled || isEmpty}
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image: image,
                  })
                }
                className="bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              >
                Save
              </Button>
            </div>
          )}
          {variant === "create" && (
            <Button
              onClick={() =>
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  image: image,
                })
              }
              disabled={disabled || isEmpty}
              size={"icon"}
              className={cn(
                "ml-auto",
                isEmpty
                  ? "bg-white hover:bg-white text-muted-foreground"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              )}
            >
              <MdSend className="size-4" />
            </Button>
          )}
        </div>
      </div>
      {variant === "create" && (
        <div
          className={cn(
            "p-2 text-[10px] text-muted-foreground ml-auto opacity-0 transition-opacity",
            !isEmpty && "opacity-100"
          )}
        >
          <p>
            <strong>Shirt + Return</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
}
