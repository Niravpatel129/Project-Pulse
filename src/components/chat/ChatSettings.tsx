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
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, RefreshCcw, RotateCcw } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

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

interface ContextTextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  showSaveIndicator: boolean;
  onBlur: () => void;
}

const ContextTextarea = memo(
  ({ value, onChange, disabled, showSaveIndicator, onBlur }: ContextTextareaProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    };

    return (
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <Label htmlFor='panel-context'>Context Information</Label>
          <span
            className={`text-xs text-green-600 flex items-center transition-opacity duration-300 ${
              showSaveIndicator ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Check className='h-3 w-3 mr-1' /> Saved
          </span>
        </div>
        <Textarea
          onBlur={onBlur}
          id='panel-context'
          placeholder='Enter information about your project, preferences, or any context that would help the AI assistant better understand your needs...'
          className='h-24 text-sm resize-none'
          value={value}
          onChange={handleChange}
          disabled={disabled}
        />
        <p className='text-xs text-muted-foreground'>
          This context is included with every message sent to the AI.
        </p>
      </div>
    );
  },
);

ContextTextarea.displayName = 'ContextTextarea';

export function ChatSettings({ onClose }: ChatSettingsProps) {
  // React Query client
  const queryClient = useQueryClient();
  const contextDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [saveIndicator, setSaveIndicator] = useState<{ [key: string]: boolean }>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Fetch chat settings
  // const {
  //   data: settings,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ['chatSettings'],
  //   queryFn: async () => {
  //     const response = await newRequest.get('/chat-settings');

  //     setContextSettings(response.data.data.contextSettings);
  //     setWebSearchEnabled(response.data.data.webSearchEnabled);
  //     setSelectedStyle(response.data.data.selectedStyle);
  //     setSelectedModel(response.data.data.selectedModel);
  //     return (
  //       response.data.data || {
  //         contextSettings: response.data.data.contextSettings,
  //         webSearchEnabled: true,
  //         selectedStyle: 'default',
  //         selectedModel: 'gpt-4',
  //       }
  //     );
  //   },
  // });

  // Handle error outside of query
  useEffect(() => {
    if (error) {
      toast.error('Failed to load settings. Using defaults.');
    }
  }, [error]);

  // Local state for form values
  const [contextSettings, setContextSettings] = useState('');
  const [webSearchEnabled, setWebSearchEnabled] = useState(true);
  const [selectedStyle, setSelectedStyle] = useState('default');
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  // Save settings mutation
  const { mutate: saveSettings, isPending: isSaving } = useMutation({
    mutationFn: async (newSettings: Partial<ChatSettingsData>) => {
      const updatedSettings = {
        contextSettings,
        webSearchEnabled,
        selectedStyle,
        selectedModel,
        ...newSettings,
      };
      await newRequest.put('/chat-settings', updatedSettings);
      return updatedSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSettings'] });
    },
    onError: () => {
      toast.error('Failed to save settings.');
    },
  });

  // Reset settings mutation
  const { mutate: resetSettingsMutation, isPending: isResetting } = useMutation({
    mutationFn: async () => {
      const response = await newRequest.delete('/chat-settings');
      return response.data.data;
    },
    onSuccess: (defaultSettings) => {
      queryClient.invalidateQueries({ queryKey: ['chatSettings'] });
      toast.success('Settings reset to defaults.');
    },
    onError: () => {
      toast.error('Failed to reset settings.');
    },
  });

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

  const handleUpdateSetting = (settingName: string, newSettings: Partial<ChatSettingsData>) => {
    saveSettings(newSettings, {
      onSuccess: () => {
        return showSaveIndicator(settingName);
      },
    });
  };

  const handleContextSettingsChange = (newValue: string) => {
    setContextSettings(newValue);

    // Clear the previous timeout if it exists
    if (contextDebounceTimeout.current) {
      clearTimeout(contextDebounceTimeout.current);
    }

    // // Set a new timeout to save after user stops typing (500ms)
    // contextDebounceTimeout.current = setTimeout(() => {
    //   handleUpdateSetting('context', { contextSettings: newValue });
    // }, 500);
  };

  const handleWebSearchChange = (value: boolean) => {
    setWebSearchEnabled(value);
    handleUpdateSetting('webSearch', { webSearchEnabled: value });
  };

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
    handleUpdateSetting('style', { selectedStyle: value });
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    handleUpdateSetting('model', { selectedModel: value });
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

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    try {
      const response = await newRequest.post('/ai/refresh');
      toast.success('Cache refreshed successfully.');
    } catch (error) {
      toast.error('Failed to refresh cache.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full p-6'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full relative bg-white'>
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
              onClick={() => {
                return resetSettingsMutation();
              }}
              disabled={isSaving || isResetting}
              className='flex items-center absolute right-5 bottom-4'
            >
              <RotateCcw className='h-4 w-4 mr-1' />
              Reset
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefreshCache}
              disabled={isRefreshing}
            >
              <RefreshCcw className='h-4 w-4 mr-1' />
              Refresh Cache
            </Button>
          </div>

          {/* Context Settings */}
          <ContextTextarea
            value={contextSettings}
            onChange={handleContextSettingsChange}
            disabled={isSaving}
            showSaveIndicator={saveIndicator['context'] || false}
            onBlur={() => {
              handleUpdateSetting('context', { contextSettings: contextSettings });
            }}
          />

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
