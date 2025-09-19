import { type ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';
import s from './Layout.module.scss'

interface Props {
  children: ReactNode;
}

function MainLayout({ children }: Props) {
  return (
      <div className={s.layout}>
        <Header/>
        <div className={s.content}>{children}</div>
        <Footer/>
    </div>
  );
}

export default MainLayout;