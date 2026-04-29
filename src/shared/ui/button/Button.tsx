import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react';
import './button.styles.css';
import { getMod } from '../../lib/getMod';

type CommonProps = {
	mod?: string;
	activeClass?: string;
} & PropsWithChildren;

type ButtonProps = ComponentPropsWithoutRef<'button'> &
	CommonProps & {
		href?: never;
	};

type AnchorProps = ComponentPropsWithoutRef<'a'> &
	CommonProps & {
		href: string;
	};

type Props = ButtonProps | AnchorProps;

const isAnchorProps = (props: Props): props is AnchorProps => 'href' in props;

export const Button = (props: Props) => {
	const { mod, activeClass, ...restProps } = props;
	const className = `btn ${getMod('btn', mod)} ${activeClass ?? ''}`.trim();

	if (isAnchorProps(props)) {
		const { children, href, ...anchorProps } = restProps as AnchorProps;
		return (
			<a className={className} href={href} {...anchorProps}>
				{children}
			</a>
		);
	}

	const { children, type, ...buttonProps } = restProps as ButtonProps;
	return (
		<button className={className} type={type || 'button'} {...buttonProps}>
			{children}
		</button>
	);
};

