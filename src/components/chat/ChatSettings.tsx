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
  const [gmailConnected, setGmailConnected] = useState(false);

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

      const savedGmailConnected = localStorage.getItem('chat-gmail-connected');
      if (savedGmailConnected !== null) setGmailConnected(savedGmailConnected === 'true');
    }
  }, []);

  const handleContextSettingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContextSettings(e.target.value);
  };

  const saveSettings = () => {
    localStorage.setItem('chat-context-settings', contextSettings);
    localStorage.setItem('chat-web-search-enabled', webSearchEnabled.toString());
    localStorage.setItem('chat-selected-style', selectedStyle);
    localStorage.setItem('chat-selected-model', selectedModel);
    localStorage.setItem('chat-gmail-connected', gmailConnected.toString());
    onClose();
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 p-6 overflow-y-auto'>
        <div className='space-y-6'>
          <div>
            <h3 className='text-lg font-medium mb-1'>Assistant Settings</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Customize how your AI assistant works
            </p>
          </div>

          {/* Context Settings */}
          <div className='space-y-2'>
            <Label htmlFor='panel-context'>Context Information</Label>
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
              <Switch
                id='web-search'
                checked={webSearchEnabled}
                onCheckedChange={setWebSearchEnabled}
              />
            </div>
            <p className='text-xs text-muted-foreground'>
              Allow the assistant to search the web for real-time information.
            </p>
          </div>

          {/* Style Selector */}
          <div className='space-y-2 relative z-10'>
            <Label htmlFor='style-selector'>Use Style</Label>
            <Select value={selectedStyle} onValueChange={setSelectedStyle}>
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

          {/* Gmail Connection */}
          <div className='space-y-2'>
            <Label>Gmail Search</Label>
            <div className='flex items-center gap-2'>
              <Button
                variant={gmailConnected ? 'outline' : 'default'}
                onClick={() => {
                  return setGmailConnected(!gmailConnected);
                }}
                className='w-full'
              >
                {gmailConnected ? 'Disconnect Gmail' : 'Connect Gmail Account'}
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              {gmailConnected
                ? 'Gmail account connected. The assistant can search your emails.'
                : 'Connect your Gmail account to enable email search capabilities.'}
            </p>
          </div>

          {/* AI Model Selection */}
          <div className='space-y-2 relative z-[9]'>
            <Label htmlFor='model-selector'>AI Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
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
        <Button onClick={saveSettings} className='w-full'>
          Save & Close
        </Button>
      </div>
    </div>
  );
}

export default ChatSettings;
