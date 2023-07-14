import { observer } from 'mobx-react';
import Link from 'next/link';
import { useStores } from '/providers/StoreProvider';

function User() {
	const { uiModel, meModel } = useStores();
	const user = meModel.user;

	return (
		<div
			onClick={() => {
				uiModel.setNavBarActive(false);
			}}
			className='flex space-x-4'
		>
			{user ? (
				<>
					<Link
						href='/me'
						className={
							' hover:text-black dark:hover:text-white hover:underline bg-gray-200 dark:bg-gray-700 p-2 rounded-lg'
						}
					>
						{user.profile.first_name}
					</Link>
					<button
						onClick={() => {
							meModel.logout();
						}}
					>
						Logout
					</button>
				</>
			) : (
				<>
					<Link
						href={'/auth'}
						className='bg-white dark:bg-gray-700 p-2 rounded'
					>
						Login
					</Link>
				</>
			)}
		</div>
	);
}

export default observer(User);