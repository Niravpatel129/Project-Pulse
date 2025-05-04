import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ChatSettingsProps {
  onClose: () => void;
}

export function ChatSettings({ onClose }: ChatSettingsProps) {
  // Settings state
  const [contextSettings, setContextSettings] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [saveIndicator, setSaveIndicator] = useState<{ [key: string]: boolean }>({});

  // Load settings on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('chat-context-settings');
      if (savedSettings) {
        setContextSettings(savedSettings);
      }

      const savedWebSearchEnabled = localStorage.getItem('chat-web-search-enabled');
      if (savedWebSearchEnabled !== null) setWebSearchEnabled(savedWebSearchEnabled === 'true');

      const savedStyle = localStorage.getItem('chat-selected-style');
      if (savedStyle) setSelectedStyle(savedStyle);

      const savedModel = localStorage.getItem('chat-selected-model');
      if (savedModel) setSelectedModel(savedModel);
    }
  }, []);

  const showSaveIndicator = (setting: string) => {
    setSaveIndicator((prev) => {
      return { ...prev, [setting]: true };
    });
    setTimeout(() => {
      setSaveIndicator((prev) => {
        return { ...prev, [setting]: false };
      });
    }, 2000);
  };

  const handleContextSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContextSettings(newValue);
    localStorage.setItem('chat-context-settings', newValue);
    showSaveIndicator('context');
  };

  const handleWebSearchChange = (value: boolean) => {
    setWebSearchEnabled(value);
    localStorage.setItem('chat-web-search-enabled', value.toString());
    showSaveIndicator('webSearch');
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    localStorage.setItem('chat-selected-style', value);
    showSaveIndicator('style');
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    localStorage.setItem('chat-selected-model', value);
    showSaveIndicator('model');
  };

  const handleGmailConnectionChange = () => {
    const newValue = !gmailConnected;
    setGmailConnected(newValue);
    localStorage.setItem('chat-gmail-connected', newValue.toString());
    showSaveIndicator('gmail');
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 p-6 overflow-y-auto'>
        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium mb-1'>Assistant Settings</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Customize how your AI assistant works. Changes are saved automatically.
            </p>
          </div>

          {/* Context Settings */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='panel-context'>Context Information</Label>
              {saveIndicator.context && (
                <span className='text-xs text-green-600 flex items-center'>
                  <Check className='h-3 w-3 mr-1' /> Saved
                </span>
              )}
            </div>
            <Textarea
              id='panel-context'
              placeholder='Enter information about your project, preferences, or any context that would help the AI assistant better understand your needs...'
              className='h-24 text-sm resize-none'
              value={contextSettings}
              onChange={handleContextSettingsChange}
            />
            <p className='text-xs text-muted-foreground'>
              This context is included with every message sent to the AI.
            </p>
          </div>

          {/* Web Search Toggle */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='web-search' className='flex items-center gap-2'>
                <span>Search the Web</span>
              </Label>
              <div className='flex items-center gap-2'>
                {saveIndicator.webSearch && (
                  <span className='text-xs text-green-600 flex items-center'>
                    <Check className='h-3 w-3 mr-1' /> Saved
                  </span>
                )}
                <Switch
                  id='web-search'
                  checked={webSearchEnabled}
                  onCheckedChange={handleWebSearchChange}
                />
              </div>
            </div>
            <p className='text-xs text-muted-foreground'>
              Allow the assistant to search the web for real-time information.
            </p>
          </div>

          {/* Style Selector */}
          <div className='space-y-2 relative z-10'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='style-selector'>Use Style</Label>
              {saveIndicator.style && (
                <span className='text-xs text-green-600 flex items-center'>
                  <Check className='h-3 w-3 mr-1' /> Saved
                </span>
              )}
            </div>
            <Select value={selectedStyle} onValueChange={handleStyleChange}>
              <SelectTrigger id='style-selector' className='w-full'>
                <SelectValue placeholder='Select a style' />
              </SelectTrigger>
              <SelectContent position='popper' sideOffset={5} className='z-[9999]'>
                <SelectItem value='default'>Default</SelectItem>
                <SelectItem value='professional'>Professional</SelectItem>
                <SelectItem value='friendly'>Friendly</SelectItem>
                <SelectItem value='technical'>Technical</SelectItem>
                <SelectItem value='creative'>Creative</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              Choose the communication style for the assistant.
            </p>
          </div>

          {/* AI Model Selection */}
          <div className='space-y-2 relative z-[9]'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='model-selector'>AI Model</Label>
              {saveIndicator.model && (
                <span className='text-xs text-green-600 flex items-center'>
                  <Check className='h-3 w-3 mr-1' /> Saved
                </span>
              )}
            </div>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger id='model-selector' className='w-full'>
                <SelectValue placeholder='Select AI model' />
              </SelectTrigger>
              <SelectContent position='popper' sideOffset={5} className='z-[9999]'>
                <SelectItem value='gpt-4'>GPT-4</SelectItem>
                <SelectItem value='gpt-3.5'>GPT-3.5</SelectItem>
                <SelectItem value='claude-3-opus'>Claude 3 Opus</SelectItem>
                <SelectItem value='claude-3-sonnet'>Claude 3 Sonnet</SelectItem>
                <SelectItem value='gemini-pro'>Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
            <p className='text-xs text-muted-foreground'>
              Select which AI model powers your assistant.
            </p>
          </div>
        </div>
      </div>

      <div className='p-4 border-t mt-auto'>
        <Button onClick={onClose} className='w-full'>
          Close
        </Button>
      </div>
    </div>
  );
}

export default ChatSettings;
