import {defineAction} from 'astro:actions';
import {z} from 'astro:schema';
import {authClient} from '@/lib/auth-client';

export const server = {
	login: defineAction({
		accept: 'form',
		input: z.object({
			email: z.string().email(),
			password: z.string(),
		}),
		async handler(input) {
			const {data, error} = await authClient.signIn.email({
				email: input.email,
				password: input.password,
			});

			// Console.log(data, error);
		},
	}),
	register: defineAction({
		accept: 'form',
		input: z.object({
			email: z
				.string()
				.email('Invalid email address')
				.max(255, 'Email too long'),
			password: z
				.string()
				.min(8, 'Password must be at least 8 characters')
				.regex(/\d/, 'Must include at least one number')
				.regex(/[^A-Za-z\d]/, 'Must include at least one special character'),
		}),
		async handler(input) {
			const {data, error} = await authClient.signUp.email({
				email: input.email,
				password: input.password,
				name: '',
			});

			if (error) {
				console.log('Registration error:', error);
			}

			return data;
		},
	}),
	signOut: defineAction({
		async handler() {
			await authClient.signOut();
		},
	}),
};
