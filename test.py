# data analysis and wrangling
import pandas as pd
import numpy as np
import random as rnd

 # visualization
import seaborn as sns
import matplotlib.pyplot as plt
#%matplotlib inline

train_df = pd.read_csv('train_longevity.csv')
test_df = pd.read_csv('test_longevity.csv')
combine = [train_df, test_df]
