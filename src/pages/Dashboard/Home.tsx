import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";

import PageMeta from "../../components/common/PageMeta";




export default function Home() {

  return (
    <>
      <PageMeta
        title="Meet Owner "
        description="Meet Owner Dashboard"
      />
      <div className="gap-4 md:gap-6 space-y-6">
        <EcommerceMetrics />
      </div>
    
    </>
  );
}