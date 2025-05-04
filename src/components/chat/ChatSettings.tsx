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
import { useToast } from '@/components/ui/use-toast';
import { newRequest } from '@/utils/newRequest';
import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatSettingsProps {
  onClose: () => void;
}

interface ChatSettingsData {
  contextSettings: string;
  webSearchEnabled: boolean;
  selectedStyle: string;
  selectedModel: string;
  gmailConnected: boolean;
}

export function ChatSettings({ onClose }: ChatSettingsProps) {
  // Settings state
  const [contextSettings, setContextSettings] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [saveIndicator, setSaveIndicator] = useState<{ [key: string]: boolean }>({});
  const [gmailConnected, setGmailConnected] = useState(false);
  const contextDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load settings on initial render
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const response = await newRequest.get('/chat-settings');
        const settings = response.data.data;

        if (settings) {
          setContextSettings(settings.contextSettings || '');
          setWebSearchEnabled(settings.webSearchEnabled);
          setSelectedStyle(settings.selectedStyle || 'default');
          setSelectedModel(settings.selectedModel || 'gpt-4');
          setGmailConnected(settings.gmailConnected || false);
        }
      } catch (error) {
        console.error('Failed to load chat settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load settings. Using defaults.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const saveSettings = async (settingName: string, newSettings?: Partial<ChatSettingsData>) => {
    try {
      setIsSaving(true);

      const settings = {
        contextSettings,
        webSearchEnabled,
        selectedStyle,
        selectedModel,
        gmailConnected,
        ...newSettings,
      };

      await newRequest.put('/chat-settings', settings);
      showSaveIndicator(settingName);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = async () => {
    try {
      setIsLoading(true);
      const response = await newRequest.delete('/chat-settings');
      const defaultSettings = response.data.data;

      setContextSettings(defaultSettings.contextSettings || '');
      setWebSearchEnabled(defaultSettings.webSearchEnabled);
      setSelectedStyle(defaultSettings.selectedStyle || 'default');
      setSelectedModel(defaultSettings.selectedModel || 'gpt-4');
      setGmailConnected(defaultSettings.gmailConnected || false);

      toast({
        title: 'Success',
        description: 'Settings reset to defaults.',
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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

    // Clear the previous timeout if it exists
    if (contextDebounceTimeout.current) {
      clearTimeout(contextDebounceTimeout.current);
    }

    // Set a new timeout to save after user stops typing (500ms)
    contextDebounceTimeout.current = setTimeout(() => {
      saveSettings('context', { contextSettings: newValue });
    }, 500);
  };

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (contextDebounceTimeout.current) {
        clearTimeout(contextDebounceTimeout.current);
      }
    };
  }, []);

  const handleWebSearchChange = (value: boolean) => {
    setWebSearchEnabled(value);
    saveSettings('webSearch', { webSearchEnabled: value });
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    saveSettings('style', { selectedStyle: value });
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    saveSettings('model', { selectedModel: value });
  };

  const handleGmailConnectionChange = () => {
    const newValue = !gmailConnected;
    setGmailConnected(newValue);
    saveSettings('gmail', { gmailConnected: newValue });
  };

  const SaveIndicator = ({ setting }: { setting: string }) => {
    return (
      <span
        className={`text-xs text-green-600 flex items-center transition-opacity duration-300 ${
          saveIndicator[setting] ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Check className='h-3 w-3 mr-1' /> Saved
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full p-6'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex-1 p-6 overflow-y-auto'>
        <div className='space-y-6'>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <h3 className='text-lg font-medium mb-1'>Assistant Settings</h3>
              <p className='text-sm text-muted-foreground'>
                Customize how your AI assistant works. Changes are saved automatically.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={resetSettings}
              disabled={isSaving}
              className='flex items-center'
            >
              <RotateCcw className='h-4 w-4 mr-1' />
              Reset
            </Button>
          </div>

          {/* Context Settings */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='panel-context'>Context Information</Label>
              <SaveIndicator setting='context' />
            </div>
            <Textarea
              id='panel-context'
              placeholder='Enter information about your project, preferences, or any context that would help the AI assistant better understand your needs...'
              className='h-24 text-sm resize-none'
              value={contextSettings}
              onChange={handleContextSettingsChange}
              disabled={isSaving}
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
                <SaveIndicator setting='webSearch' />
                <Switch
                  id='web-search'
                  checked={webSearchEnabled}
                  onCheckedChange={handleWebSearchChange}
                  disabled={isSaving}
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
              <SaveIndicator setting='style' />
            </div>
            <Select value={selectedStyle} onValueChange={handleStyleChange} disabled={isSaving}>
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
              <SaveIndicator setting='model' />
            </div>
            <Select value={selectedModel} onValueChange={handleModelChange} disabled={isSaving}>
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
    </div>
  );
}

export default ChatSettings;
