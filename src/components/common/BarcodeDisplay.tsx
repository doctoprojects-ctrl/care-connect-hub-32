import Barcode from 'react-barcode';

interface Props {
  value: string;
  height?: number;
  width?: number;
  displayValue?: boolean;
}

export const BarcodeDisplay = ({ value, height = 60, width = 1.5, displayValue = true }: Props) => {
  if (!value) return null;
  return (
    <div className="bg-white p-2 inline-block rounded">
      <Barcode value={value} height={height} width={width} displayValue={displayValue} fontSize={12} />
    </div>
  );
};