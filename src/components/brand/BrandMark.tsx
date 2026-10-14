import logo from "@/assets/unveil-logo.png.asset.json";
export const BrandMark = ({ className = "h-9 w-9" }: { className?: string }) => (
  <img src={logo.url} alt="Unveil Now logo" width={36} height={36} className={`${className} object-contain scale-125`} />
);
