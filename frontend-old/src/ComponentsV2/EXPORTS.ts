/**
 * ComponentsV2 - Complete Export Index
 * 
 * This file provides a complete overview of all available exports.
 * Import from 'ComponentsV2' for convenience.
 */

// ============================================================================
// THEME PROVIDER
// ============================================================================
export { ThemeProvider, useTheme } from './ThemeProvider';

// ============================================================================
// UI COMPONENTS
// ============================================================================

// Buttons
export { Button } from './UI/Button';
export type { ButtonProps } from './UI/Button';
export { IconButton } from './UI/IconButton';

// Containers
export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from './UI/Card';

// Indicators
export { Badge } from './UI/Badge';
export { Spinner, Loading } from './UI/Spinner';

// Data Display
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from './UI/Table';

// Utilities
export { Divider } from './UI/Divider';
export { Tooltip } from './UI/Tooltip';

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export { Form, FormField, FormGroup } from './Forms/FormField';
export { Input } from './Forms/Input';
export { TextArea } from './Forms/TextArea';
export { Checkbox, Radio } from './Forms/Checkbox';
export { Select } from './Forms/Select';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export {
  Page,
  PageHeader,
  PageTitle,
  PageContent,
  PageFooter,
  Container,
} from './Layout/Page';

// ============================================================================
// NAVIGATION COMPONENTS
// ============================================================================

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarItem,
  SidebarSection,
} from './Navigation/Sidebar';

export { Breadcrumb } from './Navigation/Breadcrumb';
export { ThemeToggle } from './Navigation/ThemeToggle';

// ============================================================================
// FEEDBACK COMPONENTS
// ============================================================================

export { Alert } from './Feedback/Alert';

export { 
  Modal, 
  ModalContent, 
  ModalFooter 
} from './Feedback/Modal';

export { EmptyState } from './Feedback/EmptyState';

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================

export type {
  Size,
  Variant,
  ColorVariant,
  AlertType,
  BaseComponentProps,
  SizeableComponentProps,
  VariantComponentProps,
} from './types';

// ============================================================================
// UTILITIES
// ============================================================================

export { cn, clsx } from './utils/cn';

// ============================================================================
// EXPORT SUMMARY
// ============================================================================
/**
 * Total Exports:
 * - Theme: 2 exports (ThemeProvider, useTheme)
 * - UI: 23 exports (8 main components + sub-components)
 * - Forms: 8 exports
 * - Layout: 6 exports
 * - Navigation: 7 exports  
 * - Feedback: 5 exports
 * - Types: 7 exports
 * - Utils: 2 exports
 * 
 * TOTAL: 60+ exports
 * 
 * Usage Examples:
 * 
 * // Import main components
 * import { Button, Card, Input, Alert, Modal } from 'ComponentsV2';
 * 
 * // Import from categories
 * import { Button, Badge } from 'ComponentsV2/UI';
 * import { Input, Select } from 'ComponentsV2/Forms';
 * 
 * // Import utilities
 * import { cn } from 'ComponentsV2/utils/cn';
 * import { useTheme } from 'ComponentsV2';
 * 
 * // Import types
 * import type { ButtonProps, Size, Variant } from 'ComponentsV2';
 */
