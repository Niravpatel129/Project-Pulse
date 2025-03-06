'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { EmailComponent } from './EmailComponent';

export default function ProjectHome() {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);
  const dropdownRef = useRef(null);

  const editor = useMemo(() => {
    return withReact(createEditor());
  }, []);

  // Define templates
  const templates = {
    proposal: [
      {
        type: 'heading-one',
        children: [{ text: 'Project Proposal' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      {
        type: 'heading-two',
        children: [{ text: 'Project Overview' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Describe the project here...' }],
      },
      {
        type: 'heading-two',
        children: [{ text: 'Objectives' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'List the main objectives...' }],
      },
      {
        type: 'heading-two',
        children: [{ text: 'Timeline' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Outline the project timeline...' }],
      },
      {
        type: 'heading-two',
        children: [{ text: 'Budget' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Detail the budget information...' }],
      },
      {
        type: 'heading-two',
        children: [{ text: 'Deliverables' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'List the deliverables...' }],
      },
    ],
  };

  const renderElement = useCallback((props) => {
    switch (props.element.type) {
      case 'paragraph':
        return <p {...props.attributes}>{props.children}</p>;
      case 'bulleted-list':
        return <ul {...props.attributes}>{props.children}</ul>;
      case 'numbered-list':
        return <ol {...props.attributes}>{props.children}</ol>;
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>;
      case 'heading-one':
        return (
          <h1 className='text-2xl font-bold my-2' {...props.attributes}>
            {props.children}
          </h1>
        );
      case 'heading-two':
        return (
          <h2 className='text-xl font-semibold my-2' {...props.attributes}>
            {props.children}
          </h2>
        );
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    const { attributes, children } = props;
    let formattedChildren = children;

    if (props.leaf.bold) {
      formattedChildren = <strong>{formattedChildren}</strong>;
    }

    if (props.leaf.italic) {
      formattedChildren = <em>{formattedChildren}</em>;
    }

    return <span {...attributes}>{formattedChildren}</span>;
  }, []);

  const toggleMark = (format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      editor.removeMark(format);
    } else {
      editor.addMark(format, true);
    }
  };

  const isMarkActive = (editor, format) => {
    const marks = editor.getMarks();
    return marks ? marks[format] === true : false;
  };

  const applyTemplate = (templateName) => {
    if (templates[templateName]) {
      editor.children = templates[templateName];
      editor.onChange();
    }
  };

  const saveAsTemplate = () => {
    // In a real app, this would save the current editor content as a new template
    alert(
      'Template saved! (This is a placeholder - actual saving would be implemented in a real app)',
    );
  };

  // Handle click outside to exit editing mode
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the editor and not within the dropdown menu
      const isClickInDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      const isClickInEditor = editorRef.current && editorRef.current.contains(event.target);

      // Only exit editing mode if click is outside both editor and dropdown
      if (!isClickInEditor && !isClickInDropdown && isEditing) {
        setIsEditing(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div className='space-y-6'>
      <EmailComponent />
    </div>
  );
}
