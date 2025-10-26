import {type FC, type HTMLAttributes} from 'react';
import {cn} from '@/lib/utils';

type Props = HTMLAttributes<HTMLDivElement> & {};

export const Separator: FC<Props> = ({className, children, ...rest}) => {
	if (children) {
		return (
			<div
				className={cn(
					'w-full grid grid-cols-[1fr_auto_1fr] items-center',
					'text-muted-foreground',
					'[&>span]:bg-accent [&>span]:h-px',
					className,
				)}
				{...rest}
			>
				<span />
				<p className="px-2">{children}</p>
				<span />
			</div>
		);
	}

	return <span className={cn('h-px bg-accent w-full', className)} {...rest} />;
};
