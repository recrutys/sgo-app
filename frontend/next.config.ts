import type {NextConfig} from "next";
const nextConfig: NextConfig = {
    sassOptions: {
        additionalData: `@use "@/app/variables.scss" as *;`,
    },
};
export default nextConfig;