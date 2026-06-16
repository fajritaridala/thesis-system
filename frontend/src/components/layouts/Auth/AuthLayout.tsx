import { motion } from 'framer-motion';
import Header from '@/components/common/Header';

type Props = {
  title?: string;
  children: React.ReactNode;
};

const AuthLayout = (props: Props) => {
  const { title, children } = props;
  return (
    <>
      <Header title={title} />
      <main className="flex h-screen items-center justify-center bg-bg-dark">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, ease: "easeInOut" }}
          className="w-full flex justify-center"
        >
          {children}
        </motion.div>
      </main>
    </>
  );
};

export default AuthLayout;