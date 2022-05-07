import React from 'react';
import Navbar from '../navigation/Navbar';

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <footer>
        <div>This blog is developed by Gatsby and Copyright by @MartianLee</div>
      </footer>
    </div>
  );
}
