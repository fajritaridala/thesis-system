import Head from 'next/head';

type Props = {
  title?: string;
};

const Header = (props: Props) => {
  const { title = 'Toefl-Verification' } = props;
  return (
    <Head>
      <title>{title}</title>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
  );
};

export default Header;
