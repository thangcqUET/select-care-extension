# Select Care Browser Extension

A powerful Chrome extension for intelligent text se### 📊 **Sidebar Dashboard**
- **Chrome Sidebar**: Integrated sidebar panel for managing selections
- **Compact Design**: Optimized layout for narrow sidebar view
- **Real-time Filtering**: Search and filter by tags or action types
- **Quick Access**: One-click access from extension popup
- **Persistent View**: Sidebar stays open while browsing management. Select Care allows users to capture, categorize, and interact with selected text through an intuitive popup interface.

## ✨ Features

### 🎯 **Smart Text Selection**
- **Instant Popup**: Beautiful glassmorphism popup appears when text is selected
- **Three Action Types**: Remember words for translation, save as notes, or ask AI questions
- **Smooth Animations**: Cubic-bezier transitions with bounce effects

### 🏷️ **Advanced Tag System**
- **Smart Tag Input**: Custom tag input component with visual chips
- **No Prefix Required**: Simply type tag names without special characters
- **Keyboard Friendly**: Enter to add tags, backspace to remove
- **Hidden Function Tags**: Automatic categorization by action type
- **Space Preservation**: Handles tags with spaces correctly

### 💾 **Data Persistence**
- **IndexedDB Storage**: All selections saved locally in browser's IndexedDB
- **Real-time Updates**: Dashboard refreshes automatically when new selections are saved
- **CRUD Operations**: Create, read, update, and delete selections
- **Data Privacy**: All data stored locally on user's machine
- **No Cloud Dependency**: Works completely offline

### ⌨️ **Smart Keyboard Handling**
- **Shortcut Prevention**: Prevents webpage shortcuts (like X.com's "n" key) from interfering
- **Custom Event System**: Advanced keyboard event handling through Shadow DOM
- **Focus Management**: Intelligent detection of user typing states

### 🔧 **Extension Popup**
- **Quick Access**: Click the extension icon for instant access
- **Usage Instructions**: Visual guide on how to use the extension
- **Action Preview**: See all three action types (Remember, Note, AI)
- **Sidebar Access**: One-click button to open the management sidebar
- **Modern Design**: Glassmorphism UI matching the content script design

### 🎨 **Modern UI Design**
- **Glassmorphism**: Translucent backgrounds with backdrop blur effects
- **Responsive**: Adapts to different screen sizes and positions
- **Accessibility**: Proper focus states and keyboard navigation
- **Consistent Styling**: Apple-inspired design language throughout

## 🚀 **Getting Started**

### **Installation**
1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load `dist` folder as unpacked extension in Chrome
5. **Note**: Sidebar API requires Chrome 114+ for full functionality

### **Chrome Sidebar Requirements**
- **Chrome Version**: 114 or higher
- **Developer Mode**: Enable in Chrome extensions page
- **Permissions**: Extension includes `sidePanel` permission
- **Fallback**: If sidebar fails, dashboard opens in new tab

### **Usage**
1. **Select Text**: Highlight any text on a webpage
2. **Choose Action**: Click one of three buttons:
   - 🌐 **Remember**: Translate and save new words
   - 📝 **Note**: Save selection with tags
   - 🤖 **Ask AI**: Get AI insights about the text
3. **Add Details**: Fill in the form popup with relevant information
4. **Save**: Your selection is processed and stored
5. **Access Dashboard**: Click the extension icon and select "Open Dashboard"

## 📋 Action Types

### 🌐 Remember (Translation)
- **Purpose**: Save words/phrases for language learning
- **Input**: Target language (defaults to English)
- **Use Case**: Building vocabulary, learning new terms
- **Hidden Tag**: `fn_remember` (automatically added)

### 📝 Note
- **Purpose**: Save text selections with categorized tags
- **Input**: Flexible tag system (no prefix required)
- **Use Case**: Research, bookmarking, content organization
- **Hidden Tag**: `fn_note` (automatically added)

### 🤖 Ask AI
- **Purpose**: Get AI analysis or explanation of selected text
- **Input**: Custom question about the selection
- **Use Case**: Understanding complex concepts, getting summaries
- **Hidden Tag**: `fn_chat` (automatically added)

## 📊 **Dashboard**

### **Management Interface**
A React-based dashboard for managing and viewing all saved selections:

- **Modern UI**: Built with React + TypeScript + Vite + TailwindCSS
- **Real-time Filtering**: Search by text, filter by tags and action types
- **Visual Organization**: Cards with glassmorphism design and action icons
- **Tag Management**: Visual tag chips with filtering capabilities
- **Source Tracking**: Links back to original webpage sources

### **Dashboard Features**
- 🔍 **Search**: Find selections by text content or source URL
- 🏷️ **Tag Filtering**: Filter by user tags (excluding function tags)
- 📝 **Action Filtering**: Filter by Remember/Note/AI Chat actions
- 📅 **Timestamp Display**: See when each selection was made
- 🔗 **Source Links**: Click to visit the original webpage

### **Access Dashboard**
- Open `chrome://extensions/`
- Find "Select Care Extension"
- Click "Options" or access via `dashboard.html`

## 🏷️ **Tag System**

### **Automatic Function Tags**
Each action type automatically includes a hidden function tag for easy filtering:
- **Remember actions**: `fn_remember`
- **Note actions**: `fn_note` + user tags
- **AI actions**: `fn_chat`

### **User Tags (Notes only)**
- Type any text and press Enter to create tags
- Support for multi-word tags: `machine learning`, `front end development`
- No special prefix required
- Visual blue chips with edit/remove functionality

## 🛠️ Technical Architecture

### **Component Structure**
```
src/
├── content_scripts/        # Content script functionality
│   ├── content.ts          # Main content script
│   ├── components/
│   │   └── TagInput.ts     # Reusable tag input component
│   ├── utils.ts            # Utility functions
│   └── data_mapper.ts      # Data transformation
├── dashboard/              # React dashboard
│   ├── Dashboard.tsx       # Main dashboard component
│   ├── main.tsx           # React entry point
│   ├── dashboard.html     # Dashboard HTML template
│   └── index.css          # TailwindCSS styles
├── extension_popup/        # Extension popup UI
└── service_worker/         # Background script
```

### **Key Technologies**
- **TypeScript**: Full type safety with discriminated unions
- **Shadow DOM**: Style encapsulation and isolation
- **Custom Events**: Advanced keyboard event handling
- **CSS Animations**: Smooth transitions and micro-interactions
- **Chrome Extension APIs**: Content scripts and background workers

### **Event System**
```typescript
// Custom keyboard event handling
tagInput.dispatchKeyEvent(key, { ctrlKey, metaKey, altKey, shiftKey });

// Real-time callbacks
onInputChange: (value) => console.log('User typing:', value)
onTagsChange: (tags) => console.log('Tags updated:', tags)
```

## 🔧 Development

### **Build Commands**
```bash
# Development build with watch mode
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### **Project Structure**
```
select-care-extension/
├── src/
│   ├── content_scripts/     # Content script functionality
│   ├── extension_popup/     # Extension popup UI
│   ├── service_worker/      # Background script
│   └── types/              # TypeScript definitions
├── public/                 # Static assets and manifest
└── dist/                   # Built extension files
```

## 🎛️ Configuration

### **Manifest Configuration**
The extension uses Manifest V3 with these key permissions:
- `activeTab`: Access to current tab content
- `storage`: Local data persistence
- `scripting`: Content script injection

### **Tag Input Options**
```typescript
new TagInput({
  placeholder: 'Type tag name and press Enter...',
  maxTags: 10,
  allowDuplicates: false,
  onTagsChange: (tags) => handleTagChange(tags),
  onInputChange: (value) => handleInput(value)
});
```

## 🐛 Troubleshooting

### **Common Issues**
1. **Tags not creating**: Ensure you press Enter after typing
2. **Popup not appearing**: Check if text is properly selected
3. **Keyboard shortcuts interfering**: The extension automatically handles this

### **Debugging**
- Open Chrome DevTools → Console to see extension logs
- Check `chrome://extensions/` for error messages
- Verify extension is enabled and permissions granted

## 🔮 Future Enhancements

- [ ] **Backend Integration**: API calls for translation and AI services
- [ ] **Data Synchronization**: Cloud storage and cross-device sync
- [ ] **Export Features**: Export notes and tags to various formats
- [ ] **Advanced Search**: Search through saved selections and notes
- [ ] **Themes**: Multiple UI themes and customization options

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📧 Support

For questions, bug reports, or feature requests, please open an issue on GitHub.

---

**Made with ❤️ for better text management and learning**
