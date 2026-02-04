import { type LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

export interface DrawerButtonProps {
  btn_icon?: LucideIcon;
  title: string;
  onClick?: () => void;
}
export default function DrawerButton({
  btn_icon,
  title,
  onClick,
}: DrawerButtonProps) {
  const Icon = btn_icon;
  return (
    <Button
    size={'sm'}
      className=""
      onClick={() => onClick?.()}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span className="max-lg:hidden">{title}</span>
    </Button>
  );
}
