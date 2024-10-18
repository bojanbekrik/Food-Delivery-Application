// app/index.tsx (or app.tsx if you use app directory)

import React from 'react';
import HomePage from './page';  // Import HomePage component

// Main App Component
const App = () => {
    return <HomePage />;  // Just render the HomePage, as routing is handled by Next.js
};

export default App;
