# Expense Tracking App

A comprehensive expense tracking and shopping list management app built with React Native and Expo.

## Features

### 🔐 Authentication
- User sign up and sign in functionality
- Secure authentication with AsyncStorage persistence
- Automatic navigation based on authentication state

### 📱 Item Library Management
- Create items by taking photos or selecting from gallery
- Add item details: name, price, category
- View all items in a clean, organized library
- Delete items with confirmation

### 🛒 Shopping List Creation
- Create shopping lists by selecting items from your library
- Customize list names
- Select multiple items for each list
- Real-time item count and total cost calculation

### 📋 Shopping List Management
- View all shopping lists in card format
- See list name, total cost, and item count at a glance
- Tap lists to view detailed breakdown
- Remove items from lists
- Delete entire shopping lists

### 📊 Profile & Statistics
- User profile with avatar and information
- Comprehensive statistics:
  - Total items in library
  - Number of shopping lists
  - Total value of all items
  - Total value of all shopping lists
- Sign out functionality

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Storage**: AsyncStorage for local data persistence
- **Image Handling**: Expo Image Picker and Camera
- **Styling**: React Native StyleSheet with theme support
- **TypeScript**: Full type safety throughout the app

## Project Structure

```
expense-tracking-app/
├── app/                          # App screens and navigation
│   ├── (tabs)/                  # Tab-based navigation
│   │   ├── index.tsx            # Items library screen
│   │   ├── shopping-lists.tsx   # Shopping lists screen
│   │   └── profile.tsx          # User profile screen
│   ├── auth/                    # Authentication screens
│   │   ├── signin.tsx           # Sign in screen
│   │   └── signup.tsx           # Sign up screen
│   └── shopping-list/           # Shopping list detail
│       └── [id].tsx             # Dynamic shopping list detail
├── components/                   # Reusable components
│   ├── AddItemModal.tsx         # Modal for adding new items
│   ├── CreateShoppingListModal.tsx # Modal for creating lists
│   └── ShoppingListCard.tsx     # Shopping list card component
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx          # Authentication state management
│   └── DataContext.tsx          # Items and shopping lists data
├── types/                        # TypeScript type definitions
│   └── index.ts                 # App data models
└── constants/                    # App constants
    └── Colors.ts                # Theme color definitions
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## Key Components

### Authentication Flow
- Users start at sign-in screen
- New users can navigate to sign-up
- After authentication, users are redirected to main app
- Authentication state persists across app restarts

### Item Management
- Camera integration for taking item photos
- Image picker for selecting existing photos
- Form validation for required fields
- Real-time preview of selected images

### Shopping List Workflow
1. Add items to library with photos and details
2. Create shopping lists by selecting items
3. View lists with total costs and item counts
4. Tap lists to see detailed breakdown
5. Manage items within lists

## Data Models

### Item
```typescript
interface Item {
  id: string;
  name: string;
  price: number;
  imageUri?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### ShoppingList
```typescript
interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ShoppingListItem
```typescript
interface ShoppingListItem {
  itemId: string;
  quantity: number;
  item: Item;
}
```

## Features in Detail

### Camera Integration
- Request camera permissions
- Take photos with custom aspect ratio
- Image quality optimization
- Edit photos before saving

### Image Management
- Support for both camera and gallery
- Image preview with remove option
- Fallback placeholder for items without images
- Optimized image storage

### Shopping List Creation
- Multi-select interface for items
- Real-time selection feedback
- Validation for list names and item selection
- Smooth modal interactions

### Data Persistence
- Local storage using AsyncStorage
- Automatic data loading on app start
- Real-time updates across all screens
- Data integrity with proper error handling

## Future Enhancements

- Cloud synchronization
- Multiple user support
- Advanced analytics and reporting
- Export functionality
- Barcode scanning for items
- Price history tracking
- Budget management features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
