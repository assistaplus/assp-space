import { observer } from 'mobx-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Input from '/components/Input';
import Select from '/components/Select';
import Textarea from '/components/Textarea';
import { useStores } from '/providers/StoreProvider';

const newJobExperience = {
	employer: '',
	position: '',
	date_from: '',
	date_to: '',
};

const socialNetworksTypes = [
	// 'Slack', 'LinkedIn', 'GitHub', 'Phone', 'Instagram', 'Telegram', 'Discord', 'Other'
	{ key: 'Slack', value: 'Slack' },
	{ key: 'LinkedIn', value: 'LinkedIn' },
	{ key: 'GitHub', value: 'GitHub' },
	{ key: 'Phone', value: 'Phone' },
	{ key: 'Instagram', value: 'Instagram' },
	{ key: 'Telegram', value: 'Telegram' },
	{ key: 'Discord', value: 'Discord' },
	{ key: 'Other', value: 'Other' },
];

function ProfileEditor({ isSignUpForm = false }) {
	const { uiModel, meModel } = useStores();
	const editorProfile = meModel.editorProfile;
	const router = useRouter();

	function handleChange(e) {
		meModel.updateEditorProfile({
			[e.target.name]: e.target.value,
		});
	}

	return (
		<div className='flex flex-col space-y-6 rounded-lg p-6 bg-white dark:bg-gray-700 w-full'>
			<div className='text-2xl font-light'>Edit profile</div>
			<form
				onSubmit={async (e) => {
					e.preventDefault();
					await meModel.editProfile();
					meModel.getProfile();
					isSignUpForm ? router.push('/') : uiModel.toggleModal();
				}}
				className='flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:space-y-0 lg:gap-8'
			>
				<Input
					label='First name'
					type='text'
					id='first_name'
					name='first_name'
					value={editorProfile.first_name}
					onChange={handleChange}
					required={true}
				/>
				<Input
					label='Last name'
					type='text'
					id='last_name'
					name='last_name'
					value={editorProfile.last_name}
					onChange={handleChange}
					required={true}
				/>
				<Input
					label='Nationality'
					type='text'
					id='nationality'
					name='nationality'
					value={editorProfile.nationality}
					onChange={handleChange}
					required={true}
				/>
				<Input
					label='University'
					type='text'
					id='university'
					name='university'
					value={editorProfile.university}
					onChange={handleChange}
					required={true}
				/>
				<Input
					label='Degree level'
					type='text'
					id='degree_level'
					name='degree_level'
					value={editorProfile.degree_level}
					onChange={handleChange}
					required={true}
				/>
				<Input
					label='Degree name'
					type='text'
					id='degree_name'
					name='degree_name'
					value={editorProfile.degree_name}
					onChange={handleChange}
					required={true}
				/>
				<Input
					label='Semester'
					type='number'
					id='degree_semester'
					name='degree_semester'
					value={editorProfile.degree_semester}
					onChange={handleChange}
					required={true}
				/>
				<Input
					label='Current job'
					type='text'
					id='currentJob'
					name='currentJob'
					value={editorProfile.currentJob}
					onChange={handleChange}
				/>
				<div className='col-span-2'>
					<Textarea
						label='Description'
						type='text'
						id='description'
						name='description'
						value={editorProfile.description}
						onChange={handleChange}
						required={false}
					/>
				</div>
				<hr className='col-span-2' />
				{/* Job Experience Editor */}
				<JobExperience />
				<hr className='col-span-2' />
				{/* Social Networks Editor */}
				<SocialNetworks />
				<hr className='col-span-2' />
				<div className='col-span-2 flex space-x-2'>
					<button
						type='submit'
						className='p-4 px-8 py-1 rounded-lg w-1/2 bg-gray-200 text-black'
					>
						<div>save</div>
					</button>
					{isSignUpForm ? null : (
						<button
							onClick={() => {
								// if user currently signs up, redirect him to main page
								uiModel.toggleModal();
							}}
							className='p-4 px-8 py-1 rounded-lg w-1/2 border-2'
						>
							<div>cancel</div>
						</button>
					)}
				</div>
			</form>
		</div>
	);
}

function SocialNetworks() {
	const { meModel } = useStores();
	const editorProfile = meModel.editorProfile;
	const [selectedOptions, setSelectedOptions] = useState(
		editorProfile.social_networks &&
			editorProfile.social_networks.map((network) => network.type)
	);

	const newSocialNetwork = {
		type: '',
		link: '',
		profile_id: editorProfile.id,
	};

	function handleAddExperience(type, newExperience) {
		if (!editorProfile[type]) {
			meModel.updateEditorProfile({
				[type]: [newExperience],
			});
			return;
		}

		meModel.updateEditorProfile({
			[type]: [...editorProfile[type], newExperience],
		});
	}

	function handleRemoveExperience(index, type) {
		const updatedExperience = [...editorProfile[type]];
		updatedExperience.splice(index, 1);
		meModel.updateEditorProfile({
			[type]: updatedExperience,
		});
	}

	function handleListItemChange(event, index, type) {
		const { name, value } = event.target;
		const updatedProfile = editorProfile[type].map((item, i) => {
			return i === index ? { ...item, [name]: value } : item;
		});
		meModel.updateEditorProfile({ [type]: updatedProfile });
	}

	const handleSelect = (item, index) => {
		const updatedSelectedOptions = [...selectedOptions];
		updatedSelectedOptions[index] = item.value;
		setSelectedOptions(updatedSelectedOptions);
		meModel.updateEditorProfile({
			social_networks: editorProfile.social_networks.map((network, i) => {
				if (i === index) {
					return {
						...network,
						type: item.value,
					};
				}
				return network;
			}),
		});
	};

	return (
		<div className='w-full col-span-2 space-y-4'>
			<div className='col-span-2 text-xl font-light'>Social Networks</div>
			<div className='col-span-2 text-black font-light'>
				Feel free to add any relevant social media networks (e.g.
				LinkedIn, GitHub, etc.) here.
			</div>
			{editorProfile.social_networks &&
				editorProfile.social_networks.map((experience, index) => (
					<div
						key={index}
						className='border-2 border-gray-100 rounded-2xl p-4'
					>
						<Select
							setSelectedItem={(item) =>
								handleSelect(item, index)
							}
							selectedItem={{
								key: experience.type,
								value: experience.type,
							}}
							placeholder='Select an option'
							data={socialNetworksTypes}
							name='type'
							label='Type'
							disabled={false}
						/>
						<Input
							label='Link'
							type='text'
							name='link'
							required={true}
							value={experience.link}
							onChange={(e) =>
								handleListItemChange(
									e,
									index,
									'social_networks'
								)
							}
						/>
						<button
							onClick={() =>
								handleRemoveExperience(index, 'social_networks')
							}
						>
							Remove
						</button>
					</div>
				))}
			<button
				className='hover:text-black mt-4 dark:hover:text-white hover:underline bg-gray-200 dark:bg-gray-700 p-2 rounded-lg'
				onClick={() =>
					handleAddExperience('social_networks', newSocialNetwork)
				}
			>
				Add Social Network
			</button>
		</div>
	);
}

function JobExperience() {
	const { meModel } = useStores();
	const editorProfile = meModel.editorProfile;

	function handleAddExperience(type, newExperience) {
		if (!editorProfile[type]) {
			meModel.updateEditorProfile({
				[type]: [newExperience],
			});
			return;
		}

		meModel.updateEditorProfile({
			[type]: [...editorProfile[type], newExperience],
		});
	}

	function handleRemoveExperience(index, type) {
		const updatedExperience = [...editorProfile[type]];
		updatedExperience.splice(index, 1);
		meModel.updateEditorProfile({
			[type]: updatedExperience,
		});
	}

	function handleListItemChange(event, index, type) {
		const { name, value } = event.target;
		const updatedProfile = editorProfile[type].map((item, i) => {
			return i === index ? { ...item, [name]: value } : item;
		});
		meModel.updateEditorProfile({ [type]: updatedProfile });
	}

	return (
		<div className='w-full col-span-2 space-y-4'>
			<div className='col-span-2 text-xl font-light'>Job history</div>
			<div className='col-span-2 text-black font-light'>
				You can update your job history and add your previous work
				experience here.
			</div>
			{editorProfile.job_history &&
				editorProfile.job_history.map((experience, index) => (
					<div
						key={index}
						className='border-2 border-gray-100 rounded-2xl p-4'
					>
						<Input
							label='Employer'
							type='text'
							name='employer'
							value={experience.employer}
							required={true}
							onChange={(e) =>
								handleListItemChange(e, index, 'job_history')
							}
						/>
						<Input
							label='Position'
							type='text'
							name='position'
							required={true}
							value={experience.position}
							onChange={(e) =>
								handleListItemChange(e, index, 'job_history')
							}
						/>
						<Input
							label='Start date'
							type='date'
							name='date_from'
							required={true}
							value={experience.date_from}
							onChange={(e) =>
								handleListItemChange(e, index, 'job_history')
							}
						/>
						<Input
							label='End date'
							type='date'
							name='date_to'
							required={true}
							value={experience.date_to}
							onChange={(e) =>
								handleListItemChange(e, index, 'job_history')
							}
						/>
						<button
							onClick={() =>
								handleRemoveExperience(index, 'job_history')
							}
						>
							Remove
						</button>
					</div>
				))}
			<button
				className='hover:text-black mt-4 dark:hover:text-white hover:underline bg-gray-200 dark:bg-gray-700 p-2 rounded-lg'
				onClick={() =>
					handleAddExperience('job_history', newJobExperience)
				}
			>
				Add Work Experience
			</button>
		</div>
	);
}

export default observer(ProfileEditor);