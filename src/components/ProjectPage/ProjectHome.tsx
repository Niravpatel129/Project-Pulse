'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bold, ChevronDown, Italic, List, ListOrdered, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';

export default function ProjectHome() {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize the Slate editor
  const editor = useMemo(() => {
    return withReact(createEditor());
  }, []);

  // Define initial content
  const initialValue: Descendant[] = [
    {
      children: [{ text: 'Project: Website Redesign for ABC Corp' }],
    },
    {
      children: [{ text: 'Client: ABC Corporation' }],
    },
    {
      children: [{ text: 'Start Date: January 15, 2024' }],
    },
    {
      children: [{ text: 'Expected Completion: March 30, 2024' }],
    },
    {
      children: [{ text: 'Project Overview' }],
    },
    {
      children: [
        {
          text: 'Complete redesign of the corporate website with focus on improved user experience, mobile responsiveness, and integration with their CRM system.',
        },
      ],
    },
    {
      children: [{ text: 'Current Status: In Progress' }],
    },
    {
      children: [
        {
          text: 'Design phase completed. Development started on January 25th. Currently implementing the homepage and product catalog sections.',
        },
      ],
    },
  ];

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
      <div
        ref={editorRef}
        className='rounded-md p-3 min-h-[300px]'
        onClick={() => {
          return !isEditing && setIsEditing(true);
        }}
      >
        <Slate editor={editor} initialValue={initialValue}>
          {/* Always render the toolbar but conditionally show/hide it to prevent layout shift */}
          <div
            className={`flex items-center justify-between mb-2 p-1 border-b ${
              isEditing ? 'visible' : 'invisible overflow-hidden'
            }`}
          >
            <div className='flex items-center space-x-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return toggleMark('bold');
                }}
              >
                <Bold className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  return toggleMark('italic');
                }}
              >
                <Italic className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='sm'>
                <List className='h-4 w-4' />
              </Button>
              <Button variant='ghost' size='sm'>
                <ListOrdered className='h-4 w-4' />
              </Button>
            </div>
            <div className='flex items-center space-x-2' ref={dropdownRef}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='flex items-center'>
                    Templates <ChevronDown className='h-4 w-4 ml-1' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      return applyTemplate('proposal');
                    }}
                  >
                    Proposal Template
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant='outline' size='sm' onClick={saveAsTemplate}>
                <Save className='h-4 w-4 mr-1' /> Save Template
              </Button>
            </div>
          </div>
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder='Click to edit project details...'
            className='min-h-[280px] outline-none'
          />
        </Slate>
      </div>
    </div>
  );
}
