import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DrawerFormLayoutProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  formContent: React.ReactNode;
  cancelButton: React.ReactNode;
  drawerButton?: React.ReactNode;
}

export default function DrawerFormLayout({
  open,
  setOpen,
  title,
  description,
  formContent,
  cancelButton,
  drawerButton,
}: DrawerFormLayoutProps) {
  return (
    <>
      <Drawer direction="right" open={open} onOpenChange={setOpen}>
        <DrawerTrigger className="">{drawerButton}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <ScrollArea className="h-[90vh]">
            <div className="m-4">
              {formContent}
              <DrawerClose asChild className="mt-3 mb-26">
                {cancelButton}
              </DrawerClose>
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </>
  );
}
