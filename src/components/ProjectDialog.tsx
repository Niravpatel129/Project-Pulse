import { motion } from 'framer-motion';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDialog({ isOpen, onClose }: ProjectDialogProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className='bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto'
      >
        <div className='flex'>
          {/* Left sidebar */}
          <div className='w-[370px] bg-gray-50 p-8 pb-10 rounded-l-lg'>
            <div className='flex items-center mb-2'>
              <div className='w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white mr-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-6 h-6'
                >
                  <path
                    fillRule='evenodd'
                    d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <span className='font-medium'>whitespace</span>
            </div>

            <div className='text-right mb-8'>
              <span className='text-gray-500 text-sm'>Save as draft</span>
            </div>

            <div className='border-b border-gray-200 mb-6'></div>

            <h2 className='text-2xl font-bold mb-1'>New Project</h2>
            <p className='text-gray-600 text-sm mb-10'>
              Create new project to help researchers and teams manage their investments and research
              outcomes all in one place.
            </p>

            <div className='space-y-4'>
              <div className='flex items-center'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white mr-3'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <span className='font-medium'>Project setup</span>
              </div>
              <div className='flex items-center'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-900 text-gray-900 mr-3'>
                  2
                </div>
                <span className='font-medium'>Funding details</span>
              </div>
              <div className='flex items-center text-gray-500'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 mr-3'>
                  3
                </div>
                <span className='text-gray-500'>Research team</span>
              </div>
              <div className='flex items-center text-gray-500'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 mr-3'>
                  4
                </div>
                <span className='text-gray-500'>Experiment & Timeline</span>
              </div>
              <div className='flex items-center text-gray-500'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 mr-3'>
                  5
                </div>
                <span className='text-gray-500'>Repository</span>
              </div>
              <div className='flex items-center text-gray-500'>
                <div className='flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 mr-3'>
                  6
                </div>
                <span className='text-gray-500'>Summary</span>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className='flex-1 p-8'>
            <div className='max-w-3xl'>
              <div className='grid grid-cols-2 gap-8 mb-12'>
                <div>
                  <div className='mb-1 text-gray-900'>Start date</div>
                  <div className='relative'>
                    <input
                      type='text'
                      className='w-full py-3 px-4 border border-gray-200 rounded-lg pl-10'
                      placeholder='Select date'
                      value='October 29, 2024'
                      readOnly
                    />
                    <div className='absolute left-3 top-3 text-gray-500'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <div className='mb-1 text-gray-900'>Goal</div>
                  <div className='relative'>
                    <input
                      type='text'
                      className='w-full py-3 px-4 border border-gray-200 rounded-lg pl-10'
                      placeholder='Enter amount'
                      value='500,000.00'
                    />
                    <div className='absolute left-3 top-3 text-gray-500'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z' />
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mb-10'>
                <h3 className='text-lg font-medium text-gray-900 mb-1'>
                  Is this project funded by internal resources?
                </h3>
                <p className='text-gray-500 text-sm mb-4'>
                  Understanding the funding source helps manage stakeholder expectations and
                  reporting project outcomes.
                </p>

                <div className='relative mb-3'>
                  <div className='absolute z-10 bg-gray-900 text-white rounded text-sm p-3 -top-12 left-4 max-w-xs'>
                    Select &apos;No&apos; if external funding is involved and
                    <br />
                    choose detail your sources of funding.
                    <div className='absolute -bottom-2 left-4 w-4 h-4 bg-gray-900 rotate-45'></div>
                  </div>
                </div>

                <div className='flex space-x-2'>
                  <button className='py-2 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800'>
                    Yes
                  </button>
                  <button className='py-2 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50'>
                    No
                  </button>
                </div>
              </div>

              <div className='mb-12'>
                <h3 className='text-lg font-medium text-gray-900 mb-6'>Financing sources</h3>
                <div className='space-y-4'>
                  <div className='p-4 border border-gray-200 rounded-lg'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center'>
                        <svg className='mr-2 h-5 w-5 text-gray-500' fill='none' viewBox='0 0 24 24'>
                          <path
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M12 6.5v11M16.5 10l-4.5-4-4.5 4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                          ></path>
                        </svg>
                        <span>University funds</span>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-1'>
                          <span className='text-gray-500'>$</span>
                          <span>235,000.00</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                          <span className='text-gray-500'>%</span>
                          <span>22,5</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-4 border border-gray-200 rounded-lg'>
                    <div className='flex justify-between items-center mb-4'>
                      <div className='flex items-center'>
                        <svg className='mr-2 h-5 w-5 text-gray-500' fill='none' viewBox='0 0 24 24'>
                          <path
                            stroke='currentColor'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 13a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                          ></path>
                        </svg>
                        <span>Private investors</span>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-1'>
                          <span className='text-gray-500'>$</span>
                          <span>125,000.00</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                          <span className='text-gray-500'>%</span>
                          <span>25</span>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex justify-between items-center py-3 hover:bg-gray-50 rounded px-2'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-800 mr-3 flex-shrink-0'>
                            J
                          </div>
                          <div>
                            <div>Jackson Adams</div>
                            <div className='text-gray-500 text-sm'>jackson.adams@google.com</div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                          <div className='flex items-center space-x-1'>
                            <span className='text-gray-500'>$</span>
                            <span>5,562.50</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <span className='text-gray-500'>%</span>
                            <span>4,45</span>
                          </div>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                            >
                              <path
                                fillRule='evenodd'
                                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className='flex justify-between items-center py-3 hover:bg-gray-50 rounded px-2'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-800 mr-3 flex-shrink-0'>
                            B
                          </div>
                          <div>
                            <div>Benjamin Rivera</div>
                            <div className='text-gray-500 text-sm'>benjaminr@framer.com</div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                          <div className='flex items-center space-x-1'>
                            <span className='text-gray-500'>$</span>
                            <span>0</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <span className='text-gray-500'>%</span>
                            <span>0</span>
                          </div>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                            >
                              <path
                                fillRule='evenodd'
                                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className='flex justify-between items-center py-3 hover:bg-gray-50 rounded px-2'>
                        <div className='flex items-center'>
                          <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-800 mr-3 flex-shrink-0'>
                            H
                          </div>
                          <div>
                            <div>Harper Anderson</div>
                            <div className='text-gray-500 text-sm'>harperanderson@rive.app</div>
                          </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                          <div className='flex items-center space-x-1'>
                            <span className='text-gray-500'>$</span>
                            <span>0</span>
                          </div>
                          <div className='flex items-center space-x-1'>
                            <span className='text-gray-500'>%</span>
                            <span>0</span>
                          </div>
                          <button className='text-gray-400 hover:text-gray-600'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              className='h-5 w-5'
                              viewBox='0 0 20 20'
                              fill='currentColor'
                            >
                              <path
                                fillRule='evenodd'
                                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                clipRule='evenodd'
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex justify-between items-center'>
                <div className='text-sm text-gray-500'>
                  <span className='mr-1'>press</span>
                  <span className='px-2 py-1 bg-gray-100 rounded text-xs font-mono'>Enter↵</span>
                </div>
                <div className='flex items-center'>
                  <div className='flex items-center mr-4'>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    <span>2/6 steps</span>
                  </div>
                  <button className='bg-gray-900 text-white px-4 py-2 rounded-lg'>Continue</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
