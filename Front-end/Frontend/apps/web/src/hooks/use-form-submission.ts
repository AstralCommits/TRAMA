import { type FormEvent, useCallback, useState } from 'react';

export const HONEYPOT_FIELD = 'company_website';

export type FormSubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export type FormValues = Record<string, FormDataEntryValue | FormDataEntryValue[]>;

type FieldErrors = Record<string, string>;

type FormSubmissionOptions = {

	submit: (values: FormValues, formData: FormData) => Promise<unknown>;

	resetOnSuccess?: boolean;
};

const toValues = (formData: FormData): FormValues => {
	const values: FormValues = {};

	for (const key of new Set(formData.keys())) {
		const entries = formData.getAll(key);

		values[key] = entries.length > 1 ? entries : entries[0];
	}

	return values;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const fieldErrorsFrom = (error: unknown): FieldErrors => {
	const data = isRecord(error) && isRecord(error.response) ? error.response.data : null;

	if (!isRecord(data)) {
		return {};
	}

	return Object.fromEntries(Object.entries(data)
		.filter((entry): entry is [string, { message: string }] => isRecord(entry[1]) && typeof entry[1].message === 'string')
		.map(([field, detail]) => [field, detail.message]));
};

const statusFrom = (error: unknown): number => (isRecord(error) && typeof error.status === 'number' ? error.status : 0);

const HONEYPOT_STYLE = {
	position: 'absolute',
	left: '-10000px',
	width: '1px',
	height: '1px',
	overflow: 'hidden',
} as const;

export function useFormSubmission({ submit, resetOnSuccess = true }: FormSubmissionOptions) {
	const [status, setStatus] = useState<FormSubmissionStatus>('idle');
	const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
	const [errorStatus, setErrorStatus] = useState<number | null>(null);

	const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const form = event.currentTarget;
		const formData = new FormData(form);
		const honeypot = formData.get(HONEYPOT_FIELD);

		formData.delete(HONEYPOT_FIELD);

		if (typeof honeypot === 'string' && honeypot !== '') {
			setStatus('success');
			form.reset();

			return;
		}

		setStatus('submitting');
		setFieldErrors({});
		setErrorStatus(null);

		try {
			await submit(toValues(formData), formData);
			setStatus('success');

			if (resetOnSuccess) {
				form.reset();
			}
		} catch (error) {
			setFieldErrors(fieldErrorsFrom(error));
			setErrorStatus(statusFrom(error));
			setStatus('error');
		}
	}, [submit, resetOnSuccess]);

	const reset = useCallback(() => {
		setStatus('idle');
		setFieldErrors({});
		setErrorStatus(null);
	}, []);

	return {
		onSubmit,
		status,
		isSubmitting: status === 'submitting',
		isSuccess: status === 'success',
		isError: status === 'error',
		fieldErrors,
		errorStatus,
		reset,
		honeypotProps: {
			name: HONEYPOT_FIELD,
			type: 'text',
			tabIndex: -1,
			autoComplete: 'off',
			'aria-hidden': true,
			style: HONEYPOT_STYLE,
		},
	};
}
