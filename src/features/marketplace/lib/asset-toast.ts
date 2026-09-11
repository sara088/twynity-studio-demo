import { toast } from "sonner";

export function showAssetAddedToast(assetName: string) {
  toast.success("Added to assets", {
    description: `${assetName} is now available in your assets.`,
  });
}
