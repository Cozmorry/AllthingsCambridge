const Label = ({ children, required, className = '', ...props }) => {
    return (
        <label className={`block text-sm font-semibold text-gray-700 mb-1.5 ${className}`} {...props}>
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    )
}

export default Label
