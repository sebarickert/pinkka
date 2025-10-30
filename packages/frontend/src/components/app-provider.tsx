import {useState, type FC} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

type Props = {
	children: React.ReactNode;
};

const defaultOptions = {
	queries: {
		staleTime: 60 * 100,
	},
};

export const AppProvider: FC<Props> = ({children}) => {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions,
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};
