import { useState } from 'react';
import { Condition, FormElement, FormValues } from '../types/formTypes';
import { generateId } from '../utils/elementUtils';

export const useFormConditions = (
  formElements: FormElement[],
  setFormElements: (elements: FormElement[]) => void,
  editingElement: FormElement | null,
  setEditingElement: (element: FormElement | null) => void,
) => {
  const [showConditionBuilder, setShowConditionBuilder] = useState(false);

  // Add a condition to an element
  const addCondition = (elementId: string) => {
    const element = formElements.find((el) => {
      return el.id === elementId;
    });
    if (!element) return;

    // Find elements that can be used as condition sources (those that come before this element)
    const availableSources = formElements.filter((el) => {
      return (
        el.order < element.order &&
        (el.type === 'Radio Buttons' ||
          el.type === 'Dropdown' ||
          el.type === 'Checkboxes' ||
          el.type === 'Single Response' ||
          el.type === 'Short Answer' ||
          el.type === 'Long Answer' ||
          el.type === 'Phone Number')
      );
    });

    if (availableSources.length === 0) {
      alert(
        'You need to add elements that can be used as condition sources before adding conditions.',
      );
      return;
    }

    // Create a new condition
    const newCondition: Condition = {
      id: generateId(),
      sourceElementId: availableSources[0].id,
      operator: 'equals',
      value: '',
    };

    // Add the condition to the element
    const updatedElement = {
      ...element,
      conditions: element.conditions ? [...element.conditions, newCondition] : [newCondition],
    };

    // Update the element in the form
    const updatedElements = formElements.map((el) => {
      return el.id === elementId ? updatedElement : el;
    });

    setFormElements(updatedElements);
    setEditingElement(updatedElement);
    setShowConditionBuilder(true);
  };

  // Remove a condition
  const removeCondition = (elementId: string, conditionId: string) => {
    const updatedElements = formElements.map((element) => {
      if (element.id === elementId && element.conditions) {
        return {
          ...element,
          conditions: element.conditions.filter((condition) => {
            return condition.id !== conditionId;
          }),
        };
      }
      return element;
    });

    setFormElements(updatedElements);

    if (editingElement && editingElement.id === elementId) {
      setEditingElement({
        ...editingElement,
        conditions: editingElement.conditions?.filter((condition) => {
          return condition.id !== conditionId;
        }),
      });
    }
  };

  // Update a condition
  const updateCondition = (elementId: string, conditionId: string, updates: Partial<Condition>) => {
    const updatedElements = formElements.map((element) => {
      if (element.id === elementId && element.conditions) {
        return {
          ...element,
          conditions: element.conditions.map((condition) => {
            return condition.id === conditionId ? { ...condition, ...updates } : condition;
          }),
        };
      }
      return element;
    });

    setFormElements(updatedElements);

    if (editingElement && editingElement.id === elementId) {
      setEditingElement({
        ...editingElement,
        conditions: editingElement.conditions?.map((condition) => {
          return condition.id === conditionId ? { ...condition, ...updates } : condition;
        }),
      });
    }
  };

  // Update the "showWhen" value (all/any) for an element
  const updateShowWhen = (elementId: string, showWhen: 'all' | 'any') => {
    const updatedElements = formElements.map((element) => {
      if (element.id === elementId) {
        return {
          ...element,
          showWhen,
        };
      }
      return element;
    });

    setFormElements(updatedElements);

    if (editingElement && editingElement.id === elementId) {
      setEditingElement({
        ...editingElement,
        showWhen,
      });
    }
  };

  // Function to evaluate if an element should be shown based on its conditions
  const shouldShowElement = (element: FormElement, formValues: FormValues): boolean => {
    if (!element.conditions || element.conditions.length === 0) return true;

    const conditionResults = element.conditions.map((condition) => {
      const sourceElement = formElements.find((el) => {
        return el.id === condition.sourceElementId;
      });
      if (!sourceElement) return false;

      // Get the current value of the source element from form values
      const sourceValue = formValues[condition.sourceElementId];

      // If the source value is undefined or null, treat it as an empty string
      const actualSourceValue =
        sourceValue === undefined || sourceValue === null ? '' : String(sourceValue);

      switch (condition.operator) {
        case 'equals':
          return actualSourceValue === condition.value;
        case 'not_equals':
          return actualSourceValue !== condition.value;
        case 'contains':
          return actualSourceValue.includes(condition.value);
        case 'not_contains':
          return !actualSourceValue.includes(condition.value);
        case 'greater_than':
          return Number(actualSourceValue) > Number(condition.value);
        case 'less_than':
          return Number(actualSourceValue) < Number(condition.value);
        case 'is_empty':
          return actualSourceValue === '';
        case 'is_not_empty':
          return actualSourceValue !== '';
        case 'starts_with':
          return actualSourceValue.startsWith(condition.value);
        case 'ends_with':
          return actualSourceValue.endsWith(condition.value);
        default:
          return false;
      }
    });

    // Check if all conditions must be met or any condition
    return element.showWhen === 'all'
      ? conditionResults.every((result) => {
          return result;
        })
      : conditionResults.some((result) => {
          return result;
        });
  };

  return {
    showConditionBuilder,
    setShowConditionBuilder,
    addCondition,
    removeCondition,
    updateCondition,
    updateShowWhen,
    shouldShowElement,
  };
};
