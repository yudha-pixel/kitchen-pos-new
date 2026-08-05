# List-Detail UI Pattern Research

## Overview

The List-Detail (also known as Master-Detail) pattern is a well-established UI/UX design pattern used to display hierarchical information where users need to navigate between a collection of items (list/master) and detailed information about each item (detail).

## Core Concepts

### What is List-Detail Pattern?

A list-detail layout consists of two main components:
1. **List Pane (Master)**: Displays a collection of items in a browsable format
2. **Detail Pane**: Shows the details of a selected item from the list

The pattern adapts based on screen size:
- **Large windows**: List and detail panes appear side by side
- **Small windows**: Only one pane is visible at a time, switching as users navigate

### Three Types of Master-Detail Interactions

According to Oracle Alta UI Patterns, there are three principle master-detail interactions:

#### 1. In-Context
- Master and detail are visible on the same page
- Users can interact with either master or detail without leaving the page
- Example: Email client with message headers in left pane and message details in right pane
- **Best for**: Desktop applications with sufficient screen real estate

#### 2. Drilldown
- Traversal between pages
- Replace-in-place interaction is key
- Example: Contact list on one page, selecting a contact drills down to detail page
- Actions against master (delete) or detail (edit) take place on different pages
- **Best for**: Mobile applications and hierarchical navigation

#### 3. Popup
- Technically takes place on the same page
- Hybrid of in-context and drilldown
- Oracle emphasizes modal popups over modeless popups
- Modeless master-detail popups are rare due to user unfamiliarity
- **Best for**: Quick actions and temporary views

## Key Characteristics

### Master-Detail "Yoking"
- Master and detail are "yoked" - traversal across master objects traverses one or more detail objects
- When multiple details are yoked to the same master, the suite should allow navigation across peer details
- Users should NOT need to navigate back to master to navigate to other peer details

### Information Structure
- All list items should be hierarchical and share a homogeneous data structure
- Each list item should include additional meta information (dates, categories, tags) for quick search and sort
- Each pane should include a top app bar to ensure actions are linked directly to specific areas

## When to Use List-Detail Pattern

### Use When:
- Navigation relies on a drill-down experience
- Users need to quickly move between details from a list of items
- Displaying parent-child information pairs
- Users need to compare and switch between multiple items
- Performing tasks or actions on selected items
- Content is hierarchical and complex
- Large collections of items need to be browsed efficiently

### Don't Use When:
- Content is simple or flat
- A single-page view is more suitable
- Information doesn't have hierarchical relationships
- Quick, simple actions are the primary use case

## Responsive Behavior

### Desktop/Large Screens (>1280px)
- List panel: Fixed width, left side
- Detail panel: Fluid width, right side
- Both panes visible simultaneously
- Quick navigation between items without page reloads

### Tablet/Medium Screens (768px - 1280px)
- List panel: Fixed width or collapsible
- Detail panel: Fluid width
- May use stacked flow or side-by-side depending on content

### Mobile/Small Screens (<768px)
- Separate list view and detail view pages
- Stacked flow: Each pane displayed sequentially
- Navigation uses back button to return to list
- Detail view takes full screen when item is selected

## Implementation Best Practices

### List Pane
- Fixed width on desktop
- Display key identifying details for quick scanning
- Support search and filter functionality
- Visual indication of currently selected item
- May use virtual scroller for large datasets
- Include breadcrumbs and toolbar with action buttons

### Detail Pane
- Flexible and responsive width
- Adapts to different window sizes
- Dominates screen space when in focus
- Organize details into labeled sections (Overview, History, Attachments)
- Display status, key metrics, or quick actions
- May contain data grids, icons, fieldsets, and stats

### Navigation
- Clear visual indicators showing relationship between list item and details
- Avoid deep navigation on compact screens
- Use back button for navigation on mobile
- Support quick navigation between sibling items
- Consider predictive back animations

## Current Implementation Analysis: Mapping Resep Page

### Current Design (Single Page)
The current `/inventory/mapping` page uses a single-page design with:
- Dropdown for menu selection (recently converted to clickable list)
- Recipe mapping table displayed below
- All functionality on one page
- No separation between list and detail views

### Limitations of Current Design

#### 1. Poor Scalability
- As menu count grows, the list becomes unwieldy
- Difficult to quickly scan and find specific menus
- No efficient way to search or filter menus

#### 2. Cognitive Load
- Users see all information at once, which can be overwhelming
- No clear separation between navigation (choosing menu) and action (mapping ingredients)
- Difficult to maintain context when working with multiple menus

#### 3. Inefficient Workflow
- To check different menu recipes, users must scroll up to change selection
- No quick comparison between different menu recipes
- Sequential workflow instead of parallel exploration

#### 4. Poor Mobile Experience
- Single column layout forces users to scroll extensively
- No adaptive behavior for different screen sizes
- Difficult to use on mobile devices

#### 5. Limited Context
- No overview of all menus and their recipe status
- Difficult to see which menus have recipes and which don't
- No quick way to identify incomplete mappings

### Why List-Detail Pattern Would Be Better

#### 1. Improved Navigation Efficiency
- **Quick scanning**: List pane shows all menus at a glance with key info (name, price, recipe status)
- **Fast switching**: Click different menu to instantly see its recipe without scrolling
- **Parallel exploration**: Can quickly compare recipes across multiple menus

#### 2. Better Information Architecture
- **Clear separation**: List pane for navigation, detail pane for action
- **Hierarchical organization**: Menu → Recipe → Ingredients follows natural hierarchy
- **Context preservation**: Always see which menu you're working on

#### 3. Enhanced Productivity
- **Search and filter**: Quickly find specific menus in the list
- **Status indicators**: Visual cues showing which menus have incomplete recipes
- **Bulk operations**: Potential to select multiple menus for batch operations

#### 4. Superior Mobile Experience
- **Adaptive layout**: Side-by-side on desktop, stacked on mobile
- **Touch-friendly**: Larger tap targets in list view
- **Progressive disclosure**: Show menu list first, detail on selection

#### 5. Scalability
- **Handles growth**: Works well with 10, 100, or 1000+ menus
- **Virtual scrolling**: Efficient rendering of large lists
- **Lazy loading**: Load recipe details only when needed

#### 6. Better User Mental Model
- **Familiar pattern**: Users recognize this pattern from email clients, file explorers, etc.
- **Clear affordances**: Left side = navigation, right side = content
- **Reduced learning curve**: Intuitive interaction model

## Recommended Implementation for Mapping Resep

### Desktop Layout (Side-by-Side)
```
┌─────────────────────────────────────────────────────────┐
│ Header: Mapping Resep (BOM) - Tambah Menu, Export, Import │
├──────────────┬──────────────────────────────────────────┤
│ List Pane    │ Detail Pane                               │
│              │                                           │
│ [Search]     │ Product: Nasi Goreng                      │
│              │ Quantity: 1.00 Units                      │
│ Menu List:   │ BoM Type: ◉ Manufacture ○ Kit ○ Subcont  │
│              │                                           │
│ □ Nasi Goreng│ ──────────────────────────────────────── │
│   Rp 25.000  │ Tabs: Components | Operations | Misc     │
│   ✓ Has recipe│ ──────────────────────────────────────── │
│              │                                           │
│ □ Mie Goreng │ Components Table:                        │
│   Rp 20.000  │ ⋮⋮ Component  Quantity  Unit  Actions    │
│   ✗ No recipe│ Beras           0.2      kg    [X]       │
│              │ Daging           0.1      kg    [X]       │
│ □ Ayam Bakar │ Telur           0.05     kg    [X]       │
│   Rp 30.000  │                                           │
│   ✓ Has recipe│ Add a line | Catalog                      │
│              │                                           │
│ [Add Menu]   │ [Save Recipe]                             │
└──────────────┴──────────────────────────────────────────┘
```

### Mobile Layout (Stacked)
```
┌─────────────────────────┐
│ Mapping Resep (BOM)     │
│ [+] [Export] [Import]    │
├─────────────────────────┤
│ [Search menus...]       │
│                         │
│ Menu List:              │
│                         │
│ □ Nasi Goreng           │
│   Rp 25.000 ✓           │
│   [>]                   │
│                         │
│ □ Mie Goreng            │
│   Rp 20.000 ✗           │
│   [>]                   │
│                         │
│ □ Ayam Bakar            │
│   Rp 30.000 ✓           │
│   [>]                   │
└─────────────────────────┘
         ↓ (tap)
┌─────────────────────────┐
│ [<] Nasi Goreng          │
│ Rp 25.000               │
├─────────────────────────┤
│ Product: Nasi Goreng    │
│ Quantity: 1.00 Units   │
│ BoM Type: ◉ Manufacture │
├─────────────────────────┤
│ Tabs: Components | Ops  │
├─────────────────────────┤
│ Components Table:       │
│ ⋮⋮ Component Qty Unit  │
│ Beras 0.2 kg [X]        │
│ Daging 0.1 kg [X]        │
│ Telur 0.05 kg [X]        │
├─────────────────────────┤
│ Add a line | Catalog    │
├─────────────────────────┤
│ [Save Recipe]           │
└─────────────────────────┘
```

### Key Features to Implement

#### List Pane
- Search bar for filtering menus
- Sort options (name, price, recipe status)
- Visual indicators for recipe completion status
- Quick actions (Edit menu, Delete menu)
- Add new menu button
- Pagination or virtual scrolling for large lists

#### Detail Pane
- Header with menu name and price
- Static info section (Product, Quantity, BoM Type)
- Tab system (Components, Operations, Miscellaneous)
- Recipe mapping table with drag handles
- Catalog modal for bulk ingredient addition
- Save button with loading state
- Back button on mobile

#### Responsive Behavior
- Desktop: Side-by-side layout (30% list, 70% detail)
- Tablet: Collapsible list panel
- Mobile: Stacked navigation with back button
- Touch-optimized interactions on mobile

## Conclusion

The current single-page design of the Mapping Resep page has significant limitations in terms of scalability, user experience, and productivity. Implementing a list-detail pattern would provide:

1. **Better navigation**: Quick scanning and switching between menus
2. **Improved workflow**: Parallel exploration instead of sequential
3. **Superior mobile experience**: Adaptive layout for different screen sizes
4. **Enhanced scalability**: Handles growth in menu count efficiently
5. **Familiar user mental model**: Recognizable pattern from other applications
6. **Clearer information architecture**: Hierarchical organization of content

The list-detail pattern is particularly well-suited for this use case because:
- Menus and recipes have a clear one-to-many relationship
- Users need to work with multiple menus in a session
- Recipe mapping is a complex task that benefits from focused workspace
- The application is used across different device types (desktop, tablet, mobile)

Implementing this pattern would significantly improve the user experience and productivity of the recipe mapping workflow.
