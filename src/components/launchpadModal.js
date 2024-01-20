import { Button, Modal } from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import 'bakrypt-launchpad/dist/bakrypt-launchpad';

const LaunchpadModal = ({ config, getter, callback }) => {
	const { accessToken, testnet, open = false, showButton = true } = config;

	const [isOpen, setOpen] = useState(open);
	const modalRef = useRef();
	const openModal = () => setOpen(true);
	const closeModal = () => setOpen(false);

	useEffect(() => {
		const modal = modalRef.current;
		if (!modal) return;

		const initial = getter();

		const launchpad = document.createElement('bakrypt-launchpad');
		Object.assign(launchpad, {
			accessToken,
			initial,
		});

		if (testnet) Object.assign(launchpad, { testnet: true });

		launchpad.addEventListener('submit', (e) => {
			callback(e.detail);
		});

		modal
			.querySelector('.components-modal__content')
			.appendChild(launchpad);
	}, [isOpen, accessToken, getter, testnet, callback]);
	return (
		<>
			{showButton && (
				<>
					<p>
						To begin minting your single token, simply click on the
						button below. If you have previously set a blockchain
						token image, the system will automatically load it into
						the form.
					</p>
					<Button variant="secondary" onClick={openModal}>
						Get started
					</Button>
				</>
			)}

			{isOpen && (
				<Modal
					title="Review Assets"
					onRequestClose={closeModal}
					isFullScreen={true}
					ref={modalRef}
					shouldCloseOnClickOutside={false}
					shouldCloseOnEsc={false}
				></Modal>
			)}
		</>
	);
};

function renderLaunchpadModal(config, getter, callback) {
	return (
		<LaunchpadModal config={config} getter={getter} callback={callback} />
	);
}

export default renderLaunchpadModal;
