import React, { useEffect, useRef, useState } from 'react'
import Quill from 'quill'

interface Props {
  value: string;
}
export default function Renderer({value}: Props) {
  const [isEmpty, setIsEmpty] = useState(false)
  const renderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!renderRef.current) return;
    const container = renderRef.current;

    //创建一个​​临时的、隐藏的 Quill 实例​​，不关联任何可见的 DOM 元素。 只用来解析富文本数据到container中
    const quill = new Quill(document.createElement("div"), {
      theme: "snow",
    });
    quill.enable(false);
    const contents = JSON.parse(value);
    quill.setContents(contents);

    const isEmpty =
      quill
        .getText()
        .replace(/<(.|\n)*?>/g, "")
        .trim().length === 0;
    setIsEmpty(isEmpty);

    // 将 Quill 的 HTML 内容渲染到容器
    container.innerHTML = quill.root.innerHTML;

    return () => {
      if (container) {
        container.innerHTML = ""; // 组件卸载时清空容器
      }
    };
  }, [value]);

  if (isEmpty) {
    return null;
  }

  return (
    <div
      ref={renderRef}
      className='ql-editor ql-renderer !h-auto'
    />
  )
}
