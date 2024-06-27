import { format } from 'date-fns';
import { useBtcPrice } from '../hooks/useBtcPrice';
import { Widget } from './Widget';

/**
 * Renders a widget displaying the current BTC price.
 */
export const PriceWidget: React.FC = () => {
  const { btcPrice, isLoading, isError } = useBtcPrice();

  const title = 'Current BTC Price';
  let content = '';
  let status = '';

  if (isLoading) {
    content = '???';
    status = 'Fetching current price...';
  } else if (isError) {
    content = '💸';
    status = 'Failed to fetch BTC price';
  } else {
    content = `$${btcPrice?.price.toFixed(2)}`;
    status = `Last updated at ${format(btcPrice?.updatedAt ?? new Date(), 'HH:mm:ss')}`;
  }

  return <Widget title={title} content={content} status={status} />;
};
