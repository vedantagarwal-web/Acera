from datetime import datetime, timedelta
from nsepy import get_history
from nsepy.derivatives import get_expiry_date

def get_nse_data(symbol: str, include_options: bool = False):
    """
    Fetch NSE stock data and optionally options data.
    
    Args:
        symbol: Stock symbol (e.g., 'RELIANCE', 'INFY')
        include_options: Whether to include options data
        
    Returns:
        dict: Stock and options data
    """
    try:
        # Get stock data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)  # Last 30 days
        
        stock_data = get_history(
            symbol=symbol,
            start=start_date,
            end=end_date,
            index=False
        )
        
        # Format stock data
        latest_data = stock_data.iloc[-1] if not stock_data.empty else None
        stock_info = {
            'symbol': symbol,
            'price': float(latest_data['Close']) if latest_data is not None else None,
            'change': float(latest_data['Close'] - latest_data['Prev Close']) if latest_data is not None else None,
            'change_percent': float((latest_data['Close'] - latest_data['Prev Close']) / latest_data['Prev Close'] * 100) if latest_data is not None else None,
            'volume': int(latest_data['Volume']) if latest_data is not None else None,
            'high': float(latest_data['High']) if latest_data is not None else None,
            'low': float(latest_data['Low']) if latest_data is not None else None,
            'open': float(latest_data['Open']) if latest_data is not None else None,
            'prev_close': float(latest_data['Prev Close']) if latest_data is not None else None,
        }
        
        result = {'stock': stock_info}
        
        # Get options data if requested
        if include_options:
            # Get current month's expiry
            expiry = get_expiry_date(datetime.now().year, datetime.now().month)
            
            if latest_data is not None:
                current_price = latest_data['Close']
                strike_prices = [
                    round(current_price + (i * 100))  # Adjust strike price intervals as needed
                    for i in range(-2, 3)  # Get 2 strikes above and below current price
                ]
                
                options_data = []
                for strike in strike_prices:
                    # Get call option
                    call = get_history(
                        symbol=symbol,
                        start=end_date,
                        end=end_date,
                        option_type='CE',
                        strike_price=strike,
                        expiry_date=expiry
                    )
                    
                    # Get put option
                    put = get_history(
                        symbol=symbol,
                        start=end_date,
                        end=end_date,
                        option_type='PE',
                        strike_price=strike,
                        expiry_date=expiry
                    )
                    
                    if not call.empty:
                        call_data = call.iloc[-1]
                        options_data.append({
                            'type': 'CE',
                            'strike': strike,
                            'last_price': float(call_data['Last Price']),
                            'change': float(call_data['Change']),
                            'oi': int(call_data['Open Interest']),
                            'volume': int(call_data['Volume'])
                        })
                    
                    if not put.empty:
                        put_data = put.iloc[-1]
                        options_data.append({
                            'type': 'PE',
                            'strike': strike,
                            'last_price': float(put_data['Last Price']),
                            'change': float(put_data['Change']),
                            'oi': int(put_data['Open Interest']),
                            'volume': int(put_data['Volume'])
                        })
                
                result['options'] = options_data
        
        return result
    
    except Exception as e:
        print(f"Error fetching NSE data for {symbol}: {str(e)}")
        return None 