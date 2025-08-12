import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title,
  description, // description is still typed as string | undefined implicitly
}: {
  title: string;
  description?: string; // Made optional with ?
}) => (
  <Helmet>
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;