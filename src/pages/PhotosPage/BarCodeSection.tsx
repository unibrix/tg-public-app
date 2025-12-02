import { Cell, Section } from "@telegram-apps/telegram-ui";
import { FC } from "react";

export const BarCodeSection: FC = () => {
  return (
    <Section header="Bar Code Scanner">
      <Cell
        subtitle="Take photo or upload image"
        //TODO logic for barcode scanning
      >
        Recognize information from bar code
      </Cell>

      <Cell
        subtitle="Bar code generator"
        //TODO logic for barcode generation
      >
        Generate bar code from text
      </Cell>
    </Section>
  );
};
